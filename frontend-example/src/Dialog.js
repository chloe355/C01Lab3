import React, { useState, useEffect } from "react";
import "./App.css";

const baseNote = { title: "", content: "" };

function Dialog({ open, initialNote, closeDialog, postNote: postNoteState, patchNote: patchNoteState}) {
  // -- Dialog props --
  const [note, setNote] = useState(baseNote);
  const [status, setStatus] = useState("");

  // -- Dialog functions --
  useEffect(() => {
    !initialNote && setNote(baseNote);
    initialNote && setNote(initialNote);
  }, [initialNote]);

  const close = () => {
    setStatus("");
    setNote(baseNote);
    closeDialog();
  };

  // -- Database interaction functions by POSTING notes--
  const postNote = async () => {
    if (!note || !note.title || !note.content) {
        return 
    }

    setStatus("Loading...")

    try {
        await fetch("http://localhost:4000/postNote",
            {method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({title: note.title, content: note.content})} )
        .then(async (response) => {
            if (!response.ok) {
                setStatus(`Error trying to post note`)
                console.log("Served failed:", response.status)
            } else {
                await response.json().then((data) => {
                    postNoteState(data.insertedId, note.title, note.content)
                    //setStatus("Note posted!") // Can be replaced with close(), if you want!
                    close()
                }) 
            }
        })
    } catch (error) {
        setStatus("Error trying to post note")
        console.log("Fetch function failed:", error)
    } 
}

  //TODO- NEED TO BE implemented
  const patchNote = async () => {
    // Code for PATCH here
    if (!note || !note.title || !note.content) {
        //console.log(`Server failed: ${note}`);
        setStatus("Please fill in all fields");
        return;
      }
    
      setStatus("Updating note...");
    
      try {
        const response = await fetch(`http://localhost:4000/patchNote/${note._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: note.title, content: note.content }),
        });
    
        if (!response.ok) {
          //setStatus(`Error trying to update note`);
          console.log("Server failed:", response.status);
          return;
        }else{
            await response.json().then((data) => {
                // Assuming postNoteState updates the state of your notes, replace it with your actual update handling function
                // For example, you might want to update the note list in the parent component
                patchNoteState(data._id, note.title, note.content); 
                window.location.reload();
                setStatus("Note updated successfully!");
                close(); // Close the dialog
            });
        }
    
      } catch (error) {
        setStatus("Error trying to update note");
        console.log("Fetch function failed:", error);
      }
}

  return (
    <dialog open={open} style={DialogStyle.dialog}>
      <input
        placeholder="Your note title goes here!"
        type="text"
        value={note.title}
        maxLength={30}
        style={DialogStyle.title}
        onChange={(e) => setNote({ ...note, title: e.target.value })}
      />
      <textarea
        placeholder="Your note content goes here!"
        value={note.content}
        rows={5}
        style={DialogStyle.content}
        onChange={(e) => setNote({ ...note, content: e.target.value })}
      />
      <div style={DialogStyle.buttonWrapper}>
        <button
          onClick={initialNote ? patchNote : postNote}
          disabled={!note.title || !note.content}
        >
          {initialNote ? "Patch Note" : "Post Note"}
        </button>
        {status}
        <button style={DialogStyle.closeButton} onClick={() => close()}>
          Close
        </button>
      </div>
    </dialog>
  );
}

export default Dialog;

const DialogStyle = {
  dialog: { width: "75%" },
  title: {
    fontSize: "40px",
    display: "block",
    width: "100%",
  },
  content: {
    fontSize: "20px",
    display: "block",
    width: "100%",
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  closeButton: { justifySelf: "end" },
};