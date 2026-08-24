import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

export default function SortableHeader({
    title,
    field,
    sortConfig,
    handleSort,
}) {
    return (
        <th
            className="p-3 cursor-pointer select-none"
            onClick={() => handleSort(field)}
        >
            <div className="flex items-center gap-2">
                {title}

                {sortConfig.key !== field ? (
                    <FaSort className="text-gray-400 text-xs" />
                ) : sortConfig.direction === "asc" ? (
                    <FaSortUp className="text-darkgreen text-xs" />
                ) : (
                    <FaSortDown className="text-darkgreen text-xs" />
                )}
            </div>
        </th>
    );
}