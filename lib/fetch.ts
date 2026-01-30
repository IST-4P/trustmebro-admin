export const fetchWithCookies = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const defaults: RequestInit = {
    credentials: "include",
  };

  const config = {
    ...defaults,
    ...init,
  };

  return fetch(input, config);
};
