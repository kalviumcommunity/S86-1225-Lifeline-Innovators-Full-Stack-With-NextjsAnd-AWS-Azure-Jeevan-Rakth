export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: "include", // Include cookies for authentication
  });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "Failed to fetch data" }));
    throw new Error(error.message || "Failed to fetch data");
  }

  return res.json();
};
