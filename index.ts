import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import Anthropic from "@anthropic-ai/sdk";
import * as AnthropicSdc from "@anthropic-ai/claude-agent-sdk";



const app = new Hono()
//   async function main() {
//   const anthropic = new Anthropic({apiKey: "test-key"});

//   const msg = await anthropic.messages.create({
//     model: "claude-haiku-4-5",
//     max_tokens: 1000,
//     messages: [
//       {
//         role: "user",
//         content:
//           "Hi"
//       }
//     ]
//   });
//   console.log(msg);
// }

async function main() {
  // const anthropic = new Anthropic({ apiKey: "test-key" });
  // for await (const message of query({
  //   prompt: "Hi, how it is going?",
  //   options: { allowedTools: ["Read", "Edit", "Bash"],  },
  // })) {
  //   console.log(message); // Claude reads the file, finds the bug, edits it
  // }

  for await (const message of AnthropicSdc.query({
    prompt: "what hte crrent time?",
    options: {
      allowedTools: ["Read", "Edit", "Bash"],
      model: "claude-haiku-4-5",
      effort: "low",
      systemPrompt: `always provide response to user one of this phrathes "All done", "Done", "Finished" but structured output should be like in scheme`,
      outputFormat: {
        type: "json_schema",
        schema: {
          "type": "object",
          "properties": {
            "date": {
              "type": "string",
              "description": "Date in YYYY-MM-DD format"
            },
            "time": {
              "type": "string",
              "description": "Time in HH:mm or HH:mm:ss 24-hour format",
            },
            "timeUnix": {
              "type": "string",
              "description": "Time in UNIX format",
            },
          },
          "required": ["date", "time"]
        }
      }
    }
  }

  )) {
    console.log("====================================")

    if (message.type === "result" && message.subtype === "success") {
      console.log("=================!!!!!!!===================")

      console.log(JSON.stringify(message.result, null, 4)); // Claude reads the file, finds the bug, edits it
      console.log(JSON.stringify(message.structured_output, null, 4)); // Claude reads the file, finds the bug, edits it
      return {
        result: message.result,
        data: message.structured_output
      }
    } else {
      console.log(JSON.stringify(message, null, 4)); // Claude reads the file, finds the bug, edits it

    }


  }

  // const res = await AnthropicSdc.query({
  //   prompt: "what hte crrent time?",
  //   options: {
  //     allowedTools: ["Read", "Edit", "Bash"], outputFormat: {
  //       type: "json_schema",
  //       schema: {
  //         "type": "object",
  //         "properties": {
  //           "date": {
  //             "type": "string",
  //             "description": "Date in YYYY-MM-DD format"
  //           },
  //           "time": {
  //             "type": "string",
  //             "description": "Time in HH:mm or HH:mm:ss 24-hour format"
  //           }
  //         },
  //         "required": ["date", "time"]
  //       }
  //     }
  //   }
  // }

  // )
  // return res.next()
  //   const result = await AnthropicSdc.listSessions()
  // console.log("====List", result)

  // const firstSession = result[0]?.sessionId

  // if (!firstSession){
  return { result: null }
  // }
  //   // console.log(msg);
  //   const info = await AnthropicSdc.getSessionInfo(firstSession)
  //   // const messages = await AnthropicSdc.getSessionMessages(firstSession)
  //   return {
  //     info,
  //     // messages
  //   }
}

app.use('*', logger())

app.get('/home', (c) => c.text('hello world'))

app.get('/dice/:number', async (c) => {


  const res = await main().catch(console.error);
  // return c.text(`${c.req.param('number')} is number!`)
  return c.text(JSON.stringify(res, null, 4))
})

async function getSessions() {
  for await (const message of AnthropicSdc.query({
    prompt: "List all available sessions",
    options: {
      allowedTools: ["Read", "Edit", "Bash"],
      model: "claude-haiku-4-5",
      effort: "low",
      systemPrompt: `List all available sessions. Return structured output with a sessions array.`,
      outputFormat: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            sessions: {
              type: "array",
              description: "List of sessions",
              items: {
                type: "object",
                properties: {
                  sessionId: { type: "string", description: "Session ID" },
                  createdAt: { type: "string", description: "Session creation timestamp" }
                },
                required: ["sessionId"]
              }
            }
          },
          required: ["sessions"]
        }
      }
    }
  })) {
    if (message.type === "result" && message.subtype === "success") {
      return { result: message.result, data: message.structured_output }
    }
  }
  return { result: null }
}

app.get('/sessions', async (c) => {
  const res = await getSessions().catch(console.error)
  return c.text(JSON.stringify(res, null, 4))
})

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log('Server running at http://localhost:3000')
})
