import { useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEFAULT_CACHE_LIMIT = Number(import.meta.env.VITE_TICKET_CACHE_LIMIT || 12);

const buildConfig = (authorizedConfig = {}, params) => {
  if (!params) return authorizedConfig;
  return {
    ...authorizedConfig,
    params,
  };
};

export default function useTicketMessages({ authorizedConfig, cacheLimit = DEFAULT_CACHE_LIMIT } = {}) {
  const fetchMessages = useCallback(
    async (complaintId, { force = false, before, limit = 30 } = {}) => {
      if (!complaintId) {
        return { messages: [], hasMore: false, nextCursor: null, fromCache: false };
      }

      const params = {};
      if (before) params.before = before;
      if (limit) params.limit = limit;

      const response = await axios.get(`${API_BASE}/api/complaints/${complaintId}/messages`, buildConfig(authorizedConfig, params));
      const payload = {
        messages: response.data?.messages || [],
        hasMore: Boolean(response.data?.hasMore),
        nextCursor: response.data?.nextCursor || null,
      };
      return payload;
    },
    [authorizedConfig]
  );

  const sendMessage = useCallback(
    async (complaintId, body) => {
      if (!complaintId || !body?.trim()) return null;
      const response = await axios.post(
        `${API_BASE}/api/complaints/${complaintId}/messages`,
        { body: body.trim() },
        authorizedConfig
      );
      const savedMessage = response.data?.message;
      if (savedMessage) {
      }
      return savedMessage;
    },
    [authorizedConfig]
  );

  return {
    fetchMessages,
    sendMessage,
  };
}
