import React, { useState, useEffect } from 'react';
import {
    Editor,
    EditorProvider,
    Toolbar,
    BtnBold,
    BtnItalic,
    BtnUnderline,
    BtnStrikeThrough,
    BtnNumberedList,
    BtnBulletList,
    BtnLink,
    Separator
} from 'react-simple-wysiwyg';
import '../styles/Remarks.css';

const Remarks = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    // Uniform notification state for Green (success) and Red (error) toasts
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    const handleSave = () => {
        // 1. Validation Check: If title is empty, show RED error toast
        if (!title.trim()) {
            setNotification({
                show: true,
                message: "Action Denied: Please provide a title for these remarks.",
                type: "error"
            });
            return;
        }

        // 2. Success Logic: If title exists, show GREEN success toast
        setNotification({
            show: true,
            message: "Remark saved successfully!",
            type: "success"
        });

        // Optional: Log data or send to API here
        console.log("Saved Remark:", { title, content });
    };

    // Logic to auto-hide the notification after 3 seconds
    useEffect(() => {
        if (notification.show) {
            const timer = setTimeout(() => {
                setNotification({ ...notification, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    return (
        <div className="remarks-container">
            {/* Uniform Slide-in Notification Toast */}
            {notification.show && (
                <div className={`notification-toast ${notification.type}`}>
                    <span className="icon">
                        {notification.type === 'success' ? '✓' : '✕'}
                    </span>
                    {notification.message}
                </div>
            )}

            <div className="remarks-header">
                <h1>Hearing Remarks</h1>
                <div className="remarks-actions">
                    <button className="btn-secondary">Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Submit Remark</button>
                </div>
            </div>

            <div className="editor-paper">
                {/* Title Input Area */}
                <input
                    type="text"
                    className="remark-title-input"
                    placeholder="Remark Title (e.g., Case #12345 Hearing)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {/* WYSIWYG Editor Area */}
                <EditorProvider>
                    <Editor
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        containerProps={{
                            style: {
                                height: '750px',
                                border: 'none',
                                fontFamily: '"Times New Roman", Times, serif'
                            }
                        }}
                    >
                        <Toolbar>
                            <BtnBold />
                            <BtnItalic />
                            <BtnUnderline />
                            <BtnStrikeThrough />
                            <Separator />
                            <BtnNumberedList />
                            <BtnBulletList />
                            <Separator />
                            <BtnLink />
                        </Toolbar>
                    </Editor>
                </EditorProvider>
            </div>
        </div>
    );
};

export default Remarks;