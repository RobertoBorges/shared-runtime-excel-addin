/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
/* global console, document, Excel, Office */
import { createNestablePublicClientApplication } from "@azure/msal-browser";
import fetch from "node-fetch";
let pca = undefined;

// The initialize function must be run each time a new page is loaded
Office.onReady(async () => {
  document.getElementById("sideload-msg").style.display = "none";
  document.getElementById("app-body").style.display = "flex";
  document.getElementById("run").onclick = run;

  // Initialize the public client application
  pca = await createNestablePublicClientApplication({
    auth: {
      clientId: "92dce61a-25d2-4377-9b75-471cf5f3001a",
      authority: "https://login.microsoftonline.com/7bf7ca02-20a6-4cc7-a35d-8fa9c5fd4529",
      supportsNestedAppAuth: true,
    },
  });
});

export async function run() {
  try {
    await Excel.run(async (context) => {
      /**
       * Insert your Excel code here
       */
      const range = context.workbook.getSelectedRange();

      // Read the range address
      range.load("address");

      // Update the fill color
      range.format.fill.color = "yellow";

      await context.sync();
      console.log(`The range address was ${range.address}.`);

      // Specify minimum scopes needed for the access token.
      const tokenRequest = {
        scopes: ["User.Read", "openid", "profile"],
      };
      let accessToken = null;

      try {
        console.log("Trying to acquire token silently...");
        const userAccount = await pca.acquireTokenSilent(tokenRequest);
        console.log("Acquired token silently.");
        accessToken = userAccount.accessToken;
        range.values = [[`Token: ${accessToken}`]];
      } catch (error) {
        console.log(`Unable to acquire token silently: ${error}`);
      }

      if (accessToken === null) {
        // Acquire token silent failure. Send an interactive request via popup.
        try {
          console.log("Trying to acquire token interactively...");
          const userAccount = await pca.acquireTokenPopup(tokenRequest);
          console.log("Acquired token interactively.");
          accessToken = userAccount.accessToken;
          range.values = [[`Token: ${accessToken}`]];
        } catch (popupError) {
          // Acquire token interactive failure.
          console.log(`Unable to acquire token interactively: ${popupError}`);
        }
      }

      window.sharedState = accessToken;

      // Log error if both silent and popup requests failed.
      if (accessToken === null) {
        console.error(`Unable to acquire access token.`);
        return;
      }

      // Call the Microsoft Graph API with the access token.
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root/children?$select=name&$top=10`, {
        headers: { Authorization: accessToken },
      });

      if (response.ok) {
        // Write file names to the console.
        const data = await response.json();
        const names = data.value.map((item) => item.name);

        // Be sure the taskpane.html has an element with Id = item-subject.
        const label = document.getElementById("item-subject");

        // Write file names to task pane and the console.
        const nameText = names.join(", ");
        if (label) label.textContent = nameText;
        console.log(nameText);
      } else {
        const errorText = await response.text();
        console.error("Microsoft Graph call failed - error text: " + errorText);
      }
    });
  } catch (error) {
    console.error(error);
  }
}
