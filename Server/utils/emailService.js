import Imap from 'imap';
import { simpleParser } from 'mailparser';
import Contact from '../model/Help/contact.model.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const imapConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
};

// Processing lock to prevent concurrent processing
let isProcessing = false;
let processedInCurrentBatch = new Set();

// Parse email to extract reply
const parseEmailReply = (emailBody) => {
  if (!emailBody) return '';
  
  const lines = emailBody.split('\n');
  let replyLines = [];
  let isQuote = false;

  for (const line of lines) {
    if (line.trim().startsWith('>') || 
        (line.includes('On ') && line.includes(' wrote:')) ||
        line.includes('-----Original Message-----') ||
        line.includes('From:')) {
      isQuote = true;
      break;
    }
    if (!isQuote) {
      replyLines.push(line);
    }
  }

  const reply = replyLines.join('\n').trim();
  
  if (!reply || reply.length < 2) {
    const firstLines = emailBody.split('\n').slice(0, 5).join('\n');
    return firstLines.trim();
  }
  
  return reply;
};

// Check if email is from our system
const isFromOurSystem = (email) => {
  const ourEmail = process.env.EMAIL_USER.toLowerCase();
  
  if (email.from?.text) {
    const sender = email.from.text.toLowerCase();
    if (sender.includes(ourEmail)) {
      return true;
    }
  }
  
  return false;
};

// Check if email is a system/bounce email
const isSystemEmail = (email) => {
  const from = email.from?.text?.toLowerCase() || '';
  
  if (from.includes('mailer-daemon') || 
      from.includes('postmaster') ||
      from.includes('undelivered') ||
      from.includes('delivery') ||
      from.includes('cloudplatform-noreply')) {
    return true;
  }
  
  if (email.subject?.toLowerCase().includes('out of office') ||
      email.subject?.toLowerCase().includes('automatic reply') ||
      email.subject?.toLowerCase().includes('auto response')) {
    return true;
  }
  
  return false;
};

// Check if email is a reply from a user
const isUserReply = (email) => {
  const ourEmail = process.env.EMAIL_USER.toLowerCase();
  
  if (isSystemEmail(email)) {
    return false;
  }
  
  if (isFromOurSystem(email)) {
    return false;
  }
  
  if (email.to?.text) {
    const toText = email.to.text.toLowerCase();
    if (toText.includes(ourEmail)) {
      return true;
    }
  }
  
  if (email.cc?.text) {
    const ccText = email.cc.text.toLowerCase();
    if (ccText.includes(ourEmail)) {
      return true;
    }
  }
  
  return false;
};

// Extract Topic ID from email
const extractTopicId = (email) => {
  const { subject, text, html } = email;
  
  // 1. Check subject
  const subjectMatch = subject?.match(/TOPIC-\d+-[a-z0-9]+/i);
  if (subjectMatch) {
    return subjectMatch[0];
  }
  
  // 2. Check email body
  const bodyText = text || html || '';
  const bodyMatch = bodyText.match(/TOPIC-\d+-[a-z0-9]+/i);
  if (bodyMatch) {
    return bodyMatch[0];
  }
  
  // 3. Check for "Topic ID:" in body
  const topicIdPattern = /Topic\s*ID:?\s*(TOPIC-\d+-[a-z0-9]+)/i;
  const topicMatch = bodyText.match(topicIdPattern);
  if (topicMatch) {
    return topicMatch[1];
  }
  
  // 4. Check for Topic ID in forwarded email content
  const forwardedPattern = /[-]{2,}\s*Forwarded\s*message\s*[-]{2,}/i;
  const forwardedMatch = bodyText.match(forwardedPattern);
  if (forwardedMatch) {
    const forwardedTopicMatch = bodyText.match(/TOPIC-\d+-[a-z0-9]+/i);
    if (forwardedTopicMatch) {
      return forwardedTopicMatch[0];
    }
  }
  
  // 5. Check for Topic ID in reply quotes
  const quotedLines = bodyText.split('\n').filter(line => line.trim().startsWith('>'));
  for (const line of quotedLines) {
    const quotedTopicMatch = line.match(/TOPIC-\d+-[a-z0-9]+/i);
    if (quotedTopicMatch) {
      return quotedTopicMatch[0];
    }
  }
  
  return null;
};

// Find contact by email address
const findContactByEmail = async (senderEmail) => {
  const contact = await Contact.findOne({ 
    email: senderEmail.toLowerCase() 
  }).sort({ createdAt: -1 });
  return contact;
};

// Generate unique key for email
const generateUniqueKey = (email) => {
  // Use Gmail's message ID if available
  if (email.messageId) {
    return `msgid:${email.messageId}`;
  }
  
  // Otherwise create a combination of from, subject, and date
  const from = email.from?.text || '';
  const subject = email.subject || '';
  const date = email.date ? new Date(email.date).toISOString() : new Date().toISOString();
  
  return `email:${from.substring(0, 50)}-${subject.substring(0, 50)}-${date}`;
};

// Process incoming email reply
export const processEmailReply = async (email) => {
  try {
    // Skip if not a user reply
    if (!isUserReply(email)) {
      return;
    }
    
    const { from, subject, text, html, date, messageId: emailMessageId } = email;
    
    // Generate unique key
    const uniqueKey = generateUniqueKey(email);
    
    let senderEmail = '';
    if (from?.text) {
      const emailMatch = from.text.match(/<([^>]+)>/);
      senderEmail = emailMatch ? emailMatch[1] : from.text;
    } else if (from?.value) {
      senderEmail = from.value[0]?.address || '';
    }

    if (!senderEmail) {
      console.log(' Could not extract sender email');
      return;
    }

    // Extract topic ID
    let topicId = extractTopicId(email);
    let contact = null;
    let foundBy = 'topicId';
    
    if (!topicId) {
      console.log(` No topic ID found in email from ${senderEmail}, trying to find by email...`);
      contact = await findContactByEmail(senderEmail);
      
      if (!contact) {
        console.log(` No contact found for email: ${senderEmail}`);
        return;
      }
      
      topicId = contact.topicId;
      foundBy = 'email';
      console.log(` Found contact by email: ${topicId}`);
    } else {
      contact = await Contact.findOne({ topicId });
      
      if (!contact) {
        console.log(` No contact found for topic: ${topicId}, trying email fallback...`);
        contact = await findContactByEmail(senderEmail);
        if (contact) {
          foundBy = 'email-fallback';
          console.log(` Found contact by email fallback: ${contact.topicId}`);
        } else {
          return;
        }
      } else {
        console.log(` Found contact by Topic ID: ${topicId}`);
      }
    }

    //  CHECK FOR DUPLICATES
    // 1. Check by emailMessageId
    const existingByMessageId = contact.messages.find(
      msg => msg.emailMessageId === emailMessageId
    );
    
    if (existingByMessageId) {
      console.log(` Email ${emailMessageId} already processed (by messageId)`);
      return;
    }
    
    // 2. Check by uniqueKey
    const existingByUniqueKey = contact.messages.find(
      msg => msg.uniqueKey === uniqueKey
    );
    
    if (existingByUniqueKey) {
      console.log(` Email ${uniqueKey} already processed (by uniqueKey)`);
      return;
    }
    
    // 3. Check in processedEmailIds array (using the new method)
    if (contact.isEmailProcessed && contact.isEmailProcessed(emailMessageId)) {
      console.log(` Email ${emailMessageId} already processed (in processedEmailIds)`);
      return;
    }
    
    if (contact.isEmailProcessed && contact.isEmailProcessed(uniqueKey)) {
      console.log(` Email ${uniqueKey} already processed (in processedEmailIds)`);
      return;
    }

    // Extract the actual reply
    const replyText = parseEmailReply(text || html || '');

    if (!replyText || replyText.length < 2) {
      console.log(' Reply is too short or empty');
      return;
    }

    // Check if this is a forwarded email
    const isForwarded = (text || html || '').includes('Forwarded message') || 
                        (subject || '').toLowerCase().includes('fwd:');

    // Create new message object with all fields
    const newMessage = {
      message: replyText,
      sentBy: null,
      sentAt: new Date(date || Date.now()),
      isFromContact: true,
      status: 'pending',
      emailMessageId: emailMessageId,
      emailFrom: senderEmail,
      emailSubject: subject,
      source: 'email',
      isForwarded: isForwarded,
      foundBy: foundBy,
      uniqueKey: uniqueKey
    };

    // Add to messages array
    contact.messages.push(newMessage);

    // ========== MARK AS PROCESSED ==========
    // Add to processedEmailIds using the new method
    if (contact.addProcessedEmail) {
      if (emailMessageId) {
        contact.addProcessedEmail(emailMessageId);
      }
      if (uniqueKey) {
        contact.addProcessedEmail(uniqueKey);
      }
    } else {
      // Fallback if method doesn't exist
      if (!contact.processedEmailIds) {
        contact.processedEmailIds = [];
      }
      if (emailMessageId && !contact.processedEmailIds.includes(emailMessageId)) {
        contact.processedEmailIds.push(emailMessageId);
      }
      if (uniqueKey && !contact.processedEmailIds.includes(uniqueKey)) {
        contact.processedEmailIds.push(uniqueKey);
      }
    }
    
    contact.lastEmailCheck = new Date();

    // Update status
    if (contact.status === 'resolved' || contact.status === 'closed') {
      contact.status = 'pending';
    }

    await contact.save();

    console.log(` Processed email reply from ${senderEmail} for topic ${topicId} (Found by: ${foundBy})${isForwarded ? ' - Forwarded email' : ''}`);

    // Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    await transporter.sendMail({
      from: `"1Step System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: ` New Email Reply from ${contact.name} - ${topicId}${isForwarded ? ' (Forwarded)' : ''}`,
      html: `
        <h2>New Email Reply</h2>
        <p><strong>From:</strong> ${contact.name} (${senderEmail})</p>
        <p><strong>Topic:</strong> ${topicId}</p>
        <p><strong>Found By:</strong> ${foundBy}</p>
        ${isForwarded ? '<p><strong>📨 This is a forwarded email</strong></p>' : ''}
        <p><strong>Reply:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${replyText.replace(/\n/g, '<br>')}
        </div>
        <p><a href="${process.env.FRONTEND_URL}/admin/contact/${contact._id}">View in Dashboard</a></p>
      `
    });

    return contact;
  } catch (error) {
    console.error(' Error processing email reply:', error);
    throw error;
  }
};

// Process emails with locking
const processEmails = (imap, results) => {
  if (isProcessing) {
    console.log(' Already processing emails, skipping...');
    return;
  }
  
  isProcessing = true;
  processedInCurrentBatch = new Set();
  
  try {
    if (results && results.length > 0) {
      console.log(` Processing ${results.length} email(s)`);
      
      const fetch = imap.fetch(results, { bodies: '' });
      
      fetch.on('message', (msg, seqno) => {
        msg.on('body', (stream) => {
          simpleParser(stream, async (err, parsed) => {
            if (err) {
              console.error('Error parsing email:', err);
              return;
            }
            
            // Generate batch key
            const batchKey = parsed.messageId || generateUniqueKey(parsed);
            
            // Skip if already processed in this batch
            if (processedInCurrentBatch.has(batchKey)) {
              console.log(` Skipping duplicate in batch: ${batchKey}`);
              return;
            }
            
            processedInCurrentBatch.add(batchKey);
            await processEmailReply(parsed);
            
            // Mark as read after processing
            try {
              imap.addFlags(seqno, ['\\Seen'], (err) => {
                if (err) {
                  console.error('Error marking as read:', err);
                }
              });
            } catch (flagErr) {
              console.error('Error adding flags:', flagErr);
            }
          });
        });
      });
      
      fetch.once('error', (err) => {
        console.error('Fetch error:', err);
        isProcessing = false;
      });
      
      fetch.once('end', () => {
        console.log(' Batch processing complete');
        isProcessing = false;
      });
    } else {
      isProcessing = false;
    }
  } catch (error) {
    console.error('Error in processEmails:', error);
    isProcessing = false;
  }
};

// Watch for new emails
export const watchEmails = () => {
  const imap = new Imap(imapConfig);

  imap.once('ready', () => {
    imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        console.error('Error opening inbox:', err);
        return;
      }

    //   console.log(` Watching inbox: ${box.name} (${box.messages.total} messages)`);

      // Only process recent unread emails (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      imap.search(['UNSEEN', ['SINCE', fiveMinutesAgo]], (err, results) => {
        if (err) {
          console.error('Error searching emails:', err);
          return;
        }

        if (results && results.length > 0) {
        //   console.log(` Found ${results.length} recent unread email(s)`);
          processEmails(imap, results);
        }
      });

      // Set up listener for new emails with debouncing
      let mailTimeout = null;
      imap.on('mail', (numNewMsgs) => {
        // Debounce to prevent multiple triggers
        if (mailTimeout) {
          clearTimeout(mailTimeout);
        }
        
        mailTimeout = setTimeout(() => {
          console.log(`📨 Received ${numNewMsgs} new email(s)`);
          imap.search(['UNSEEN'], (err, results) => {
            if (err) {
              console.error('Error searching new emails:', err);
              return;
            }
            if (results && results.length > 0) {
              processEmails(imap, results);
            }
          });
        }, 3000);
      });
    });
  });

  imap.once('error', (err) => {
    console.error('IMAP error:', err);
    isProcessing = false;
    processedInCurrentBatch.clear();
    setTimeout(() => {
      console.log(' Reconnecting IMAP...');
      watchEmails();
    }, 10000);
  });

  imap.once('end', () => {
    console.log(' IMAP connection ended');
    isProcessing = false;
    processedInCurrentBatch.clear();
    setTimeout(() => {
      console.log(' Reconnecting IMAP...');
      watchEmails();
    }, 10000);
  });

  imap.connect();
};

// Start watching emails
export const startEmailWatcher = () => {
  console.log(' Starting email watcher...');
  watchEmails();
};

// Stop watching emails
export const stopEmailWatcher = () => {
  console.log(' Stopping email watcher...');
  isProcessing = false;
  processedInCurrentBatch.clear();
};