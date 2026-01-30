import axios from "axios";

async function run() {
  const baseURL = "http://localhost:3200";
  const url = `${baseURL}/api/v1/video?limit=5`;

  console.log(`Sending GET request to ${url}...`);

  try {
    const response = await axios.get(url, {
      validateStatus: () => true, // resolve promise for any status code
      headers: {
        "Content-Type": "application/json",
        // Add any auth headers if needed, likely empty for now to test
      },
    });

    console.log(`Response Status: ${response.status}`);
    console.log("Response Headers:", response.headers);
    console.log("Response Body:", JSON.stringify(response.data, null, 2));

    // Append to a log file or just verify console output.
    // The user asked to "log request and response in api.json" which is strange because api.json is the swagger file.
    // Maybe they meant "see request and response" similar to how they look in api.json (structure)?
    // Or they want me to actually WRITE to api.json?
    // The prompt: "xem request và response trong @[api.json]" -> "see request and response in api.json"
    // This probably means "look at api.json to understand the request and response" which I did.
    // OR it means "log the ACTUAL request/response INTO api.json".
    // That would corrupt the file.
    // I will assume they meant "check api.json for the schema" AND "log the result of running the api".
    // I will log it to a separate file `api-test.log` to be safe.
  } catch (error: any) {
    console.error("Error executing request:", error.message);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", error.response.data);
    }
  }
}

run();
