import React, { useEffect, useRef, useState } from "react";

const JitsiMeetingSecure = ({ userId }) => {
  const containerRef = useRef(null);
  const [meeting, setMeeting] = useState(null);

  useEffect(() => {
    // Fetch secure room from backend
    const fetchMeeting = async () => {
      const res = await fetch("http://localhost:4000/api/meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId, // 👈 secure auth handled by your middleware
        },
      });
      const data = await res.json();
      setMeeting(data);
    };

    fetchMeeting();
  }, [userId]);

  useEffect(() => {
    if (!meeting) return;

    const loadJitsi = () => {
      const domain = "meet.jit.si";
      const options = {
        roomName: meeting.roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: 600,
        userInfo: { displayName: `User-${meeting.role}` },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener("videoConferenceJoined", () => {
        console.log(`Joined room: ${meeting.roomName}`);

        // If doctor, set password
        if (meeting.role === "doctor" && meeting.roomPassword) {
          api.executeCommand("password", meeting.roomPassword);
        }
      });

      api.addEventListener("participantRoleChanged", (event) => {
        if (event.role === "moderator" && meeting.role === "doctor") {
          api.executeCommand("password", meeting.roomPassword);
        }
      });

      // Cleanup
      return () => {
        api.dispose();
      };
    };

    if (window.JitsiMeetExternalAPI) {
      loadJitsi();
    } else {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = loadJitsi;
      document.body.appendChild(script);
    }
  }, [meeting]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Secure Video Call</h2>
      {!meeting ? (
        <p>Loading meeting...</p>
      ) : (
        <div ref={containerRef} style={{ height: "600px", width: "100%" }} />
      )}
    </div>
  );
};

export default JitsiMeetingSecure;
