import { readFileSync } from 'node:fs';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const env = Object.fromEntries(
  readFileSync('C:/APU/Degree/Hackathon/MUBA-BLOCKCHAIN/.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).replace(/\s+#.*$/, '').trim()];
    }),
);

const client = new SuiGrpcClient({ network: 'testnet', baseUrl: env.NEXT_PUBLIC_SUI_RPC_URL });
const pkg = env.NEXT_PUBLIC_PACKAGE_ID;

const sponsor = Ed25519Keypair.fromSecretKey(env.SPONSOR_PRIVATE_KEY);
const sponsorAddr = sponsor.toSuiAddress();
console.log('SPONSOR address:', sponsorAddr);

try {
  const { balance } = await client.getBalance({ owner: sponsorAddr });
  console.log('SPONSOR balance:', Number(balance.balance) / 1e9, 'SUI');
} catch (e) {
  console.log('getBalance err:', e.message);
}

try {
  const { object } = await client.getObject({ objectId: env.ADMIN_CAP_ID, include: { json: true } });
  console.log('AdminCap type:', object.type);
  console.log('AdminCap owner:', JSON.stringify(object.owner));
} catch (e) {
  console.log('AdminCap getObject err:', e.message);
}

for (const et of ['DisasterZone', 'Donated', 'RegistrationSubmitted', 'AidPaid']) {
  try {
    const page = await client.listEvents({
      filter: { eventType: `${pkg}::relief_v3::${et}` },
      limit: 5,
    });
    console.log(`events ${et}: ${page.events.length}`, page.events.map((e) => e.eventType)[0] ?? '');
  } catch (e) {
    console.log(`events ${et}: err ${e.message}`);
  }
}

try {
  const { function: fn } = await client.getMoveFunction({
    packageId: pkg, moduleName: 'relief_v3', name: 'register_household',
  });
  console.log('register_household params:', JSON.stringify(fn.parameters));
} catch (e) {
  console.log('getMoveFunction err:', e.message);
}
