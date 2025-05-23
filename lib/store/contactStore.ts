import { create } from "zustand";

type ContactForm = {
  email: string;
  name: string;
  subject: string;
  message: string;
};

type ContactState = {
  contact: ContactForm;
  setContact: (contact: ContactForm) => void;
  resetContact: () => void;
};

export const useContactStore = create<ContactState>((set) => ({
  contact: {
    category: "",
    email: "",
    name: "",
    subject: "",
    message: "",
  },
  setContact: (contact) => set({ contact }),
  resetContact: () =>
    set({
      contact: {
        email: "",
        name: "",
        subject: "",
        message: "",
      },
    }),
}));