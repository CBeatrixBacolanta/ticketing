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
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        if (!title.trim()) {
            alert("Please provide a title for these remarks.");
            return;
        }
        setIsSaved(true);
    };

    useEffect(() => {
        if (isSaved) {
            const timer = setTimeout(() => setIsSaved(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isSaved]);

    return (
        <div className="remarks-container">
            {isSaved && (
                <div className="save-notification">
                    <span className="check-icon">✓</span> Remark saved successfully!
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