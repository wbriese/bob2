import fs from 'fs';
import fetch from 'node-fetch';

const html = fs.readFileSync('notFound.html', 'utf-8');

export default async function getBearer(ctx, next) {
  if (!global.bearer || Date.now() - global.bearerTimestamp > 3600000) {
    await fetch('https://api.routeguard.eu/accounts/identity/connect/token', {
      method: 'POST',
      withCredentials: true,
      credentials: 'include',
      headers: {
        Authorization: 'Basic YXBpQ2xpZW50MTc6akRiXUtmMkFAW2gmOWdkKw==',
        'Content-Type': 'String',
      },
      body: `grant_type=password&username=api_bbc&password=${process.env.METEO_PASSWORD}&scope=web default rights claims openid`,
    })
      .then((response) => response.json())
      .then((data) => {
        global.bearer = data.access_token;
        global.bearerTimestamp = Date.now();
      });
  }

  await next();
  if (ctx.status === 404) {
    ctx.body = html;
    ctx.status = 404;
  }
}
