import React from 'react';

const ViewArticle = () => {
  const articles = [
    {
      _id: "691eeee95240c6ba8d9d022e",
      title: "What is therapy?",
      excerpt: "Speech therapy can help people who have difficulty speaking to communicate better and to break down the barriers that result from speech impediments.",
      featuredImage: "",
      category: "Speech Therapy",
      tags: ["Speech Therapy", "Speech"],
      providerName: "Wasim S",
      views: 0,
      readTime: 4,
      createdAt: "2025-11-20T10:35:21.358+00:00"
    },
    {
      _id: "691eeee95240c6ba8d9d022f",
      title: "Understanding Audio Spectrum",
      excerpt: "Learn about the different aspects of autism spectrum disorder and how therapy can help.",
      featuredImage: "",
      category: "Speech Therapy",
      tags: ["Autism", "Therapy"],
      providerName: "Jeni",
      views: 42,
      readTime: 6,
      createdAt: "2025-11-19T14:20:15.358+00:00"
    },
    {
      _id: "691eeee95240c6ba8d9d0230",
      title: "Occupational Therapy Benefits",
      excerpt: "Discover how occupational therapy can improve daily living skills and independence.",
      featuredImage: "",
      category: "Occupational Therapy",
      tags: ["OT", "Rehabilitation"],
      providerName: "Dhoni",
      views: 28,
      readTime: 5,
      createdAt: "2025-11-18T09:15:30.358+00:00"
    },
    {
      _id: "691eeee95240c6ba8d9d0231",
      title: "Physical Therapy Exercises",
      excerpt: "Essential exercises for recovery and strength building in physical therapy.",
      featuredImage: "",
      category: "Physical Therapy",
      tags: ["Exercise", "Recovery"],
      providerName: "Stranger",
      views: 156,
      readTime: 7,
      createdAt: "2025-11-17T16:45:22.358+00:00"
    },
    {
      _id: "691eeee95240c6ba8d9d0232",
      title: "Mental Health Awareness",
      excerpt: "Understanding the importance of mental health and available support systems.",
      featuredImage: "",
      category: "Mental Health",
      tags: ["Mental Health", "Awareness"],
      providerName: "Things",
      views: 89,
      readTime: 8,
      createdAt: "2025-11-16T11:30:45.358+00:00"
    },
    {
      _id: "691eeee95240c6ba8d9d0233",
      title: "Child Development ",
      excerpt: "Key developmental milestones every parent should know about their child's growth.",
      featuredImage: "",
      category: "Pediatrics",
      tags: ["Children", "Development"],
      providerName: "Velbin",
      views: 203,
      readTime: 10,
      createdAt: "2025-11-15T13:25:18.358+00:00"
    },
    {
      _id: "691eeee95240c6ba8d9d0234",
      title: "Recovery",
      excerpt: "How proper nutrition plays a crucial role in the recovery process.",
      featuredImage: "",
      category: "Nutrition",
      tags: ["Diet", "Recovery"],
      providerName: "Jeno",
      views: 67,
      readTime: 6,
      createdAt: "2025-11-14T08:40:33.358+00:00"
    },
    {
      _id: "691eeee95240c6ba8d9d0235",
      title: "Yoga for Stress Relief",
      excerpt: "Simple yoga poses and techniques to manage stress and anxiety effectively.",
      featuredImage: "",
      category: "Wellness",
      tags: ["Yoga", "Stress Relief"],
      providerName: "Anita Sharma",
      views: 134,
      readTime: 5,
      createdAt: "2025-11-13T15:20:27.358+00:00"
    },
    {
      _id: "691eeee95240c6ba8d9d0236",
      title: "Cognitive Behavioral Therapy",
      excerpt: "Understanding CBT and how it helps in managing negative thought patterns.",
      featuredImage: "",
      category: "Therapy",
      tags: ["CBT", "Psychology"],
      providerName: "Dr. James Wilson",
      views: 178,
      readTime: 9,
      createdAt: "2025-11-12T10:15:39.358+00:00"
    },
    {
      _id: "691eeee95240c6ba8d9d0237",
      title: "Senior Care and Mobility",
      excerpt: "Essential tips and exercises for maintaining mobility in senior years.",
      featuredImage: "",
      category: "Geriatrics",
      tags: ["Senior Care", "Mobility"],
      providerName: "Dr. Patricia Brown",
      views: 95,
      readTime: 7,
      createdAt: "2025-11-11T12:35:51.358+00:00"
    }
  ];


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
   <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
        Latest Articles
      </h1>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {articles.map((article) => (
        <div
          key={article._id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
        >

          <div className="h-48 bg-gray-200 overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>


          <div className="p-6 flex flex-col flex-grow">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                {article.category}
              </span>
              <span className="text-sm text-gray-500">
                {article.readTime} min read
              </span>
            </div>


            <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
              {article.title}
            </h3>


            <div className="flex flex-wrap gap-1 mb-4">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {article.providerName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {article.providerName}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {formatDate(article.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {article.views} views
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200">
                  Approve
                </button>
                <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* <div className="text-center mt-12">
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300">
        Load More Articles
      </button>
    </div> */}
  </div>
</div>
  );
};

export default ViewArticle;