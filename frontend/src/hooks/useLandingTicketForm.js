import { useMemo, useState } from 'react';
import axios from 'axios';
import { getToken } from '../services/authStorage.js';

const resolveApiBase = () => {
  const url = import.meta.env.VITE_API_URL;
  if (typeof url === 'string' && url.trim().length > 0) {
    return url.trim();
  }
  if (typeof window !== 'undefined' && !!import.meta.env.DEV) {
    const protocol = window.location.protocol || 'http:';
    const hostname = window.location.hostname || 'localhost';
    return `${protocol}//${hostname}:5000`;
  }
  return null;
};

const API_BASE = resolveApiBase();

export default function useLandingTicketForm(user) {
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '', priority: 'Medium' });
  const [ticketError, setTicketError] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(null);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [configError] = useState(!API_BASE);

  const isAuthenticated = Boolean(user);
  const ticketDisabled = !isAuthenticated || creatingTicket || configError;

  const authorizedConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
    []
  );

  const updateTicketField = (field, value) => {
    setTicketForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitTicket = async () => {
    if (!isAuthenticated) {
      setTicketError('Please sign in before creating a ticket.');
      return null;
    }
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      setTicketError('Add a subject and message so we can help.');
      return null;
    }

    if (configError) {
      setTicketError('Ticket service is unavailable. Please contact support.');
      setCreatingTicket(false);
      return null;
    }

    setTicketError('');
    setCreatingTicket(true);

    try {
      const response = await axios.post(
        `${API_BASE}/api/complaints`,
        {
          title: ticketForm.subject.trim(),
          category: 'Support',
          description: ticketForm.message.trim(),
          priority: ticketForm.priority,
        },
        authorizedConfig
      );
      setTicketSuccess(response.data);
      setTicketForm({ subject: '', message: '', priority: 'Medium' });
      return response.data;
    } catch (error) {
      setTicketError(error.response?.data?.message || 'Failed to create ticket. Try again.');
      return null;
    } finally {
      setCreatingTicket(false);
    }
  };

  const resetTicketSuccess = () => {
    setTicketSuccess(null);
    setTicketError('');
  };

  return {
    ticketForm,
    ticketError,
    ticketSuccess,
    creatingTicket,
    ticketDisabled,
    configError,
    isAuthenticated,
    updateTicketField,
    submitTicket,
    resetTicketSuccess,
  };
}
