// data/mockChatData.js

export const mockSessions = [
  {
    id: 1,
    title: "Managing Stress",
    preview: "I have been feeling stressed lately...",
    time: "2h ago",
  },
  {
    id: 2,
    title: "Daily Check-In",
    preview: "Today was productive and calm.",
    time: "Yesterday",
  },
  {
    id: 3,
    title: "Sleep Improvement",
    preview: "How can I sleep better?",
    time: "2 days ago",
  },
];

export const sessionMessages = {
  1: [
    {
      text: "Hello! How are you feeling today?",
      sender: "ai",
      timestamp: "9:00 AM",
    },
    {
      text: "I've been a little stressed recently.",
      sender: "user",
      timestamp: "9:01 AM",
    },
    {
      text: "Would you like to tell me more?",
      sender: "ai",
      timestamp: "9:02 AM",
    },
  ],

  2: [
    {
      text: "How was your day today?",
      sender: "ai",
      timestamp: "8:00 PM",
    },
    {
      text: "Pretty productive actually.",
      sender: "user",
      timestamp: "8:01 PM",
    },
  ],

  3: [
    {
      text: "Tell me about your sleep habits.",
      sender: "ai",
      timestamp: "10:00 PM",
    },
    {
      text: "I've been sleeping very late.",
      sender: "user",
      timestamp: "10:01 PM",
    },
  ],
};

export const olderMessages = [
  {
    text: "Earlier conversation message...",
    sender: "ai",
    timestamp: "Yesterday",
  },
  {
    text: "Another older message...",
    sender: "user",
    timestamp: "Yesterday",
  },
];