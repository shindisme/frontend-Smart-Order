import { useState, useRef, useEffect } from 'react';

import { FaCheck } from "react-icons/fa6";
import { IoMdArrowDropdownCircle } from "react-icons/io";
import './MultiSelectGroup.css';


function MultiSelectGroup({ groups = [], value = [], onChange, isRead }) {
    const [open, setOpen] = useState(false);
    const selectRef = useRef(null);

    const nameTag = value.length > 0 ? `${value.length} nhóm đã chọn` : "Chọn nhóm tùy chọn";

    const handleToggleGroup = (groupId) => {
        if (isRead) return;

        const selectedGroups = value.includes(groupId);
        const updateSelectTag = selectedGroups
            ? value.filter(id => id !== groupId)
            : [...value, groupId];

        onChange(updateSelectTag);
    };


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="msd-container" ref={selectRef}>
            {/* select tag */}
            <div
                className={`msd-select-btn ${open ? "open" : ""}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
            >
                <span className="msd-text"> {nameTag}</span>
                <span className="msd-arrow"><IoMdArrowDropdownCircle size={24} /></span>
            </div>

            {/* dropdown */}
            {open && (
                <ul className="msd-list">
                    {groups.map(group => (
                        <li
                            key={group.group_id}
                            className={
                                `msd-item 
                                 ${value.includes(group.group_id) ? "checked" : ""}
                                 ${isRead ? "disabled" : ""}`
                            }
                            onClick={() => {
                                if (!isRead) handleToggleGroup(group.group_id);
                            }}
                        >
                            <span className="msd-checkbox">
                                <FaCheck className="msd-check-icon" />
                            </span>
                            <span className="msd-item-text">{group.name}</span>
                        </li>
                    )
                    )}
                </ul>
            )}
        </div>
    );
}

export default MultiSelectGroup;
