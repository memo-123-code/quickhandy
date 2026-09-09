const fs = require('fs');
let code = fs.readFileSync('src/app/dashboard/client/page.tsx', 'utf8');
const start = code.indexOf('<form');
const endString = 'className="p-3 bg-slate-900 border-t border-slate-800/80 flex gap-2"';
const end = code.indexOf(endString, start);

if (start > -1 && end > -1) {
  const newOnSubmit = `onSubmit={async (e) => {
                e.preventDefault();
                if (!newMessage.trim() || !bookingId) return;
                
                const textToSend = newMessage;
                setNewMessage(""); 
                
                const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                setChatMessages((prev) => [...prev, { sender: "client", text: textToSend, time }]);

                try {
                  await api.post(\`/bookings/\${bookingId}/chat\`, {
                    senderId: session?.user?.id || 'CLIENT',
                    senderRole: 'CLIENT',
                    text: textToSend
                  });
                } catch (err) {
                  console.error("Failed to send message", err);
                  toast.error("Failed to send message.");
                }
              }}
              `;
              
  code = code.substring(0, start + 5) + '\n              ' + newOnSubmit + code.substring(end);
  fs.writeFileSync('src/app/dashboard/client/page.tsx', code);
  console.log('success');
} else {
  console.log('failed to find start or end', {start, end});
}
