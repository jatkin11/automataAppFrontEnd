
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
    console.error(response.status, error);
    throw new Error("Failed to convert to DFA")
  }
  return await response.json();
}


export async function apiRegexToNFA(regexString) {
  const response = await fetch(
    "http://localhost:8080/api/automata/convert-to-nfa",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ regex: regexString }),
    }
  );

  console.log(regexString);

  if (!response.ok) {
    const error = await response.text();
    console.error(response.status, error);
    throw new Error("Failed to convert to NFA")
  }

  return await response.json();

}


export async function apiTestWordOnRegex(regexString, testWord) {
  const response = await fetch(
    "http://localhost:8080/api/automata/test-word-on-regex-string",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ regex: regexString, word: testWord }),
    }
  );

  console.log(regexString, testWord);

  if (!response.ok) {
    const error = await response.text();
    console.error(response.status, error);
    throw new Error("Failed to test word on Regex")
  }

  return await response.json();

}

export async function apiTestWordOnAutomata(graph, testWord) {
  const response = await fetch(
    "http://localhost:8080/api/automata/test-word-on-automata",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ graph, word: testWord }),
    }
  );

  console.log(graph, testWord);

  if (!response.ok) {
    const error = await response.text();
    console.error(response.status, error);
    throw new Error("Failed to test word on Automata")
  }

  return await response.json();

}


export async function apiMinimiseDFA(graph) {
  const response = await fetch(
    "http://localhost:8080/api/automata/minimise-dfa",
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
    console.error(response.status, error);
    throw new Error("Failed to minimise DFA")
  }

  return await response.json();

}


export async function apiConvertToString(graph) {
  const response = await fetch(
    "http://localhost:8080/api/automata/convert-to-regex-string",
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
    console.error(response.status,error);
    throw new Error("Failed to convert to Regex string")
  }

  return await response.json();

}
