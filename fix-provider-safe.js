const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/provider/page.tsx', 'utf8');

// 1. Add Polling useEffect
const stateTarget = `const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([]);`;
if (code.includes(stateTarget)) {
  const replacement = `const [chatMessages, setChatMessages] = useState<{ id?: string; sender: string; text: string; time: string }[]>([]);

  // Real-time Chat Polling (Short-Polling)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isChatOpen && activeJob?.id) {
      const fetchChat = async () => {
        try {
          const res = await api.get(\`/bookings/\${activeJob.id}/chat\`);
          setChatMessages(res.data);
        } catch (err) {
          console.error("Chat fetch error:", err);
        }
      };
      
      fetchChat(); // fetch immediately
      intervalId = setInterval(fetchChat, 3000); // poll every 3 seconds
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isChatOpen, activeJob?.id]);`;
  
  code = code.replace(stateTarget, replacement);
  console.log('Injected polling useEffect');
} else {
  console.log('Could not find state target');
}

// 2. Replace the form onSubmit
const formMarker = code.indexOf('{/* Message Input Form */}');
const formStart = code.indexOf('<form', formMarker);
const endString = 'className="p-3 bg-slate-900 border-t border-slate-800/80 flex gap-2"';
const formEnd = code.indexOf(endString, formStart);

if (formStart > -1 && formEnd > -1) {
  const newOnSubmit = `onSubmit={async (e) => {
                e.preventDefault();
                if (!newMessage.trim() || !activeJob?.id) return;
                
                const textToSend = newMessage;
                setNewMessage(""); 
                
                const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                setChatMessages((prev) => [...prev, { sender: "provider", text: textToSend, time }]);

                try {
                  await api.post(\`/bookings/\${activeJob.id}/chat\`, {
                    senderId: session?.user?.id || 'PROVIDER',
                    senderRole: 'PROVIDER',
                    text: textToSend
                  });
                } catch (err) {
                  console.error("Failed to send message", err);
                  toast.error("Failed to send message.");
                }
              }}
              `;
              
  code = code.substring(0, formStart + 5) + '\n              ' + newOnSubmit + code.substring(formEnd);
  console.log('Replaced form onSubmit');
} else {
  console.log('Could not find form start/end', {formStart, formEnd});
}

fs.writeFileSync('src/app/dashboard/provider/page.tsx', code);
console.log('done');
