
/**
 *  NFA-to-DFA conversion API request
 * 
 * Sends passed graph to back-end for conversion to DFA
 * 
 * @param graph graph to be converted
 * @returns converted DFA graph
 * @throws {Error} if request not OK
 */
export async function apiConvertToDFA(graph) {
  const response = await fetch(
    "https://automataappbackend.onrender.com/api/automata/convert-to-dfa",
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

/**
 * Regex-to-NFA conversion API request
 * 
 * Sends passed regex string to back-end for conversion to NFA
 * 
 * @param regexString to be converted
 * @returns converted NFA graph
 * @throws {Error} if request not OK
 */
export async function apiRegexToNFA(regexString) {
  const response = await fetch(
    "https://automataappbackend.onrender.com/api/automata/convert-to-nfa",
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


/**
 * Word-Test-On-Regex API request
 * 
 * Sends passed regex and user-inputted word to back-end to perform test
 * 
 * @param regexString regex to be tested
 * @param testWord string word to test on graph
 * @returns accepted boolean
 * @throws {Error} if request not OK
 */
export async function apiTestWordOnRegex(regexString, testWord) {
  const response = await fetch(
    "https://automataappbackend.onrender.com/api/automata/test-word-on-regex-string",
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

/**
 * Word-Test-On-Automata API request
 * 
 * Sends passed graph and user-inputted word to back-end to perform test
 * 
 * @param graph graph to be tested
 * @param testWord string word to test on graph
 * @returns accepted boolean
 * @throws {Error} if request not OK
 */
export async function apiTestWordOnAutomata(graph, testWord) {
  const response = await fetch(
    "https://automataappbackend.onrender.com/api/automata/test-word-on-automata",
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


/**
 * Minimise DFA API request
 * 
 * Sends passed graph to back-end for minimisation
 * 
 * @param graph graph to be minimised
 * @returns minimised DFA
 * @throws {Error} if request not OK
 */
export async function apiMinimiseDFA(graph) {
  const response = await fetch(
    "https://automataappbackend.onrender.com/api/automata/minimise-dfa",
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


/**
 * Automata-to-Regex conversion API request
 * 
 * Sends passed graph to back-end for conversion to regex string
 * 
 * @param graph graph to be converted
 * @returns converted regex string
 * @throws {Error} if request not OK
 */
export async function apiConvertToString(graph) {
  const response = await fetch(
    "https://automataappbackend.onrender.com/api/automata/convert-to-regex-string",
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
