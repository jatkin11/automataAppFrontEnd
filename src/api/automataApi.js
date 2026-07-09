
export async function apiConvertToDFA(graph) {
  const response = await fetch(
    "http://localhost:8080/api/automata/convert-to-dfa",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graph),
    }
  );

  console.log(graph);

  if (!response.ok) {
    const error = await response.text();
    console.error("error:", response.status, error);
    return;
  }

  return await response.json();

}