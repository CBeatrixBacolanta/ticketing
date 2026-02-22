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

    // Uniform notification state for Green and Red toasts
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });

    const handleSave = () => {
        // Check if title is empty or just spaces
        if (!title.trim()) {
            setNotification({
                show: true,
                message: "Action Denied: Please provide a title for these remarks.",
                type: "error"
            });
            return;
        }

        // Success logic
        setNotification({
            show: true,
            message: "Remark saved successfully!",
            type: "success"
        });
    };

    // Logic to hide the notification after 3 seconds
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
            {/* Uniform Slide-in Notification */}
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
                <input
                    type="text"
                    className="remark-title-input"
                    placeholder="Remark Title (e.g., Case #12345 Hearing)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

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