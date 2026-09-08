import React, { useState } from "react";
import styles from "./Chatbot.module.css";

const GREETINGS = ["hi", "hello", "hey", "salam", "assalam", "asalam", "yo", "hii", "helo"];
const THANKS = ["thanks", "thank you", "thx", "shukriya", "appreciate"];
const BYE = ["bye", "goodbye", "see you", "alvida"];
const FAQS = [
  {
    keywords: ["register", "donor", "sign up", "signup", "join as donor", "become a donor"],
    question: "How do I register as a donor?",
    answer:
      "Go to the 'Register as Donor' page from the navbar, fill in your details (name, blood group, address), pin your location on the map, and verify with the OTP sent to your email and phone.",
  },
  {
    keywords: ["login", "log in", "sign in", "signin", "access my account"],
    question: "How do I log in?",
    answer:
      "Click 'Login' from the navbar and enter your registered email/phone and password. You'll be taken to your donor or organization dashboard based on your account type.",
  },
  {
    keywords: ["forgot password", "reset password", "lost password", "can't login", "cant login"],
    question: "I forgot my password, what do I do?",
    answer:
      "Currently, password reset isn't self-service — please contact support directly to have your password reset. We recommend writing down your password somewhere safe after registering.",
  },
  {
    keywords: ["find", "blood", "near", "search", "nearby"],
    question: "How do I find blood near me?",
    answer:
      "Use the 'Find Blood' page. You can either search by district/province, or switch to 'Find Donors Near Me' to see donors within a chosen radius on a map.",
  },
  {
    keywords: ["eligible", "eligibility", "donate again", "wait", "how often"],
    question: "How is donor eligibility calculated?",
    answer:
      "Donors must wait at least 90 days between donations. Your dashboard automatically shows whether you're currently eligible or how many days remain.",
  },
  {
    keywords: ["update", "profile", "location", "address", "change", "edit"],
    question: "How do I update my profile or location?",
    answer:
      "Go to your Dashboard and click 'Update Location' or 'Edit Profile' to change your address, contact info, or pinned map location anytime.",
  },
  {
    keywords: ["otp", "verification", "code", "verify", "didn't receive", "didnt receive"],
    question: "I didn't receive my OTP, what do I do?",
    answer:
      "Check both your email inbox (including spam) and SMS. If it still doesn't arrive, use the 'Resend OTP' button on the verification screen.",
  },
  {
    keywords: ["organization", "blood bank", "register org", "hospital"],
    question: "How do I register my blood bank?",
    answer:
      "Go to 'Register as Organization', fill in your organization details, pin your location, and verify via the OTP sent to your email.",
  },
  {
    keywords: ["stock", "donate blood to bank", "blood units", "ml", "inventory"],
    question: "How does blood stock tracking work?",
    answer:
      "Organizations track blood stock in milliliters per blood group. Recording a donation increases stock; dispensing blood to a recipient decreases it.",
  },
  {
    keywords: ["org code", "organization code", "link donor", "linking", "join organization"],
    question: "How do I link my donor account to an organization?",
    answer:
      "Each organization has a unique 6-character code shown on their dashboard. Enter this code in your donor profile to link your account to that blood bank.",
  },
  {
    keywords: ["qr", "qr code", "scan"],
    question: "What is the QR code for?",
    answer:
      "Your donor QR code stores your name, blood group, and basic health info for quick verification by hospitals or blood banks during an emergency.",
  },
  {
    keywords: ["delete account", "remove account", "deactivate"],
    question: "How do I delete my account?",
    answer:
      "Account deletion isn't currently self-service — please contact support to have your account removed or deactivated.",
  },
  {
    keywords: ["contact", "support", "help", "reach", "email us", "phone number support"],
    question: "How do I contact support?",
    answer:
      "You can reach our support team via the contact details listed in the 'About' page, or email us directly for account or technical issues.",
  },
  {
    keywords: ["safe", "safety", "side effect", "pain", "hurt", "risk"],
    question: "Is donating blood safe?",
    answer:
      "Yes — blood donation is safe for healthy adults aged 18-65. Minor side effects like light-headedness can occur but typically pass quickly. Always stay hydrated before and after donating.",
  },
  {
    keywords: ["how much blood", "quantity", "how many ml", "unit size"],
    question: "How much blood is taken during donation?",
    answer:
      "A standard donation is typically around 450 ml (one unit), which your body naturally replenishes within a few weeks.",
  },
];

const DEFAULT_REPLY =
  "I'm not sure about that yet — try asking about registration, login, finding blood, eligibility, or updating your profile. You can also check the Help section for more.";

function findAnswer(text) {
  const lower = text.toLowerCase().trim();

  if (GREETINGS.some((g) => lower === g || lower.startsWith(g + " ") || lower.includes(g))) {
    return "Hello! 👋 How can I help you today? You can ask me about registering, logging in, finding blood, or your donation eligibility.";
  }
  if (THANKS.some((t) => lower.includes(t))) {
    return "You're welcome! Let me know if there's anything else I can help with. 🩸";
  }
  if (BYE.some((b) => lower.includes(b))) {
    return "Take care! Thank you for being part of Blood Needer. 👋";
  }

  const match = FAQS.find((faq) => faq.keywords.some((k) => lower.includes(k)));
  return match ? match.answer : DEFAULT_REPLY;
}

const QUICK_LINKS = [
  "How do I register as a donor?",
  "How do I log in?",
  "How do I find blood near me?",
  "How is donor eligibility calculated?",
];

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2.2" />
    <line x1="16.3" y1="16.3" x2="21" y2="21" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("home"); // "home" | "chat" | "help"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", text };
    const reply = findAnswer(text);

    setMessages((prev) => [...prev, userMsg, { role: "assistant", text: reply }]);
    setInput("");
    setView("chat");
  };

  return (
    <>
      <button
        className={styles.fab}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chatbot"
      >
        {open ? (
          <span className={styles.fabClose}>✕</span>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
            <path
              d="M12 2C6.48 2 2 6.04 2 11c0 2.55 1.18 4.85 3.1 6.47L4 22l4.95-1.62A11.4 11.4 0 0 0 12 20c5.52 0 10-4.04 10-9S17.52 2 12 2Z"
              fill="white"
            />
            <circle cx="8" cy="11" r="1.3" fill="#9f1239" />
            <circle cx="12" cy="11" r="1.3" fill="#9f1239" />
            <circle cx="16" cy="11" r="1.3" fill="#9f1239" />
          </svg>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.brand}>
                <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="19" stroke="white" strokeWidth="2" />
                  <path
                    d="M20 8 C14 14 10 18 10 23 a10 10 0 0 0 20 0 C30 18 26 14 20 8z"
                    fill="white"
                  />
                </svg>
                <span>Blood Needer</span>
              </div>
            </div>

            {view === "home" && (
              <>
                <h2 className={styles.greeting}>Hello there! 👋</h2>
                <p className={styles.subGreeting}>How can we help you today?</p>
              </>
            )}
            {view === "chat" && (
              <>
               
                <h2 className={styles.greeting} style={{ fontSize: 18, marginTop: 10 }}>
                  Chat
                </h2>
              </>
            )}
            {view === "help" && (
              <>
               
                <h2 className={styles.greeting} style={{ fontSize: 18, marginTop: 10 }}>
                  Help &amp; Support
                </h2>
              </>
            )}
          </div>

          <div className={styles.body}>
            {view === "home" && (
              <>
                <div className={styles.statusCard}>
                  <span className={styles.statusDot} />
                  <div>
                    <p className={styles.statusTitle}>All Systems Operational</p>
                    <p className={styles.statusSub}>Donor &amp; blood bank network active</p>
                  </div>
                </div>

                <div className={styles.searchBox}>
                  <input
                    type="text"
                    placeholder="Search for help…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  />
                  <button onClick={() => sendMessage(input)} aria-label="Search">
                    <SearchIcon />
                  </button>
                </div>

                <div className={styles.linksCard}>
                  {QUICK_LINKS.map((q) => (
                    <button key={q} className={styles.linkRow} onClick={() => sendMessage(q)}>
                      <span>{q}</span>
                      <span className={styles.chevron}>›</span>
                    </button>
                  ))}
                </div>

                <button className={styles.askCard} onClick={() => setView("chat")}>
                  <div>
                    <p className={styles.askTitle}>Ask a question</p>
                    <p className={styles.askSub}>Our chatbot can help</p>
                  </div>
                  <div className={styles.askAvatars}>
                    <span className={styles.avatarDot}>🩸</span>
                  </div>
                </button>
              </>
            )}

            {view === "chat" && (
              <div className={styles.chatView}>
                <div className={styles.chatMessages}>
                  {messages.length === 0 && (
                    <p className={styles.chatEmpty}>Ask me anything about Blood Needer…</p>
                  )}
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={m.role === "user" ? styles.bubbleUser : styles.bubbleAssistant}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>

                <div className={styles.chatInputRow}>
                  <input
                    type="text"
                    placeholder="Type your message…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  />
                  <button onClick={() => sendMessage(input)}>➤</button>
                </div>
              </div>
            )}

            {view === "help" && (
              <div className={styles.linksCard}>
                {FAQS.map((faq) => (
                  <button
                    key={faq.question}
                    className={styles.linkRow}
                    onClick={() => sendMessage(faq.question)}
                  >
                    <span>{faq.question}</span>
                    <span className={styles.chevron}>›</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.bottomNav}>
            <button
              className={view === "home" ? styles.navActive : styles.navBtn}
              onClick={() => setView("home")}
            >
              <span>🏠</span>
              <span>Home</span>
            </button>
            <button
              className={view === "chat" ? styles.navActive : styles.navBtn}
              onClick={() => setView("chat")}
            >
              <span>💬</span>
              <span>Messages</span>
            </button>
            <button
              className={view === "help" ? styles.navActive : styles.navBtn}
              onClick={() => setView("help")}
            >
              <span>❓</span>
              <span>Help</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;