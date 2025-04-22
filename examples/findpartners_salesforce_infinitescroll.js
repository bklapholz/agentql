const { wrap } = require("agentql");
const { chromium } = require("playwright");

async function spacebarScrollLoop(page, iterations = 200, delay = 750) {
  await page.mouse.click(200, 200); // Click to focus the page
  for (let i = 0; i < iterations; i++) {
    console.log(`Spacebar scroll iteration ${i + 1}`);
    await page.keyboard.press("Space");
    await page.waitForTimeout(delay);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await wrap(await browser.newPage());

  console.log("Navigating to the page...");
  await page.goto(
    "https://findpartners.salesforce.com?f=%5B%7B%22cI%22%3A5%2C%22pI%22%3A0%2C%22tY%22%3A%22NF%22%7D%5D",
  );

  await page.waitForLoadState();
  await page.waitForTimeout(2000); // Wait 2 seconds after load

  await spacebarScrollLoop(page);

  const QUERY = `
  {
    company_profile[] {
      company_name
      hq_location
      description
      recent_projects
      credentialed_people
      average_review_rating
      total_reviews
      expertise_details {
        expert_distinctions
        level_ii_specializations[]
        level_i_specializations[]
      }
      app_exchange_url
      logo_url
    }
  }
  `;

  console.log("Issuing AgentQL data query...");
  const response = await page.queryData(QUERY);
  console.log("AgentQL response:", response);

  await browser.close();
})();
