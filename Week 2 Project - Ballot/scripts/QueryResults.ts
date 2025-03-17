import { createPublicClient, http, parseAbi } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  let contractAddress = process.argv[2];

  if (!contractAddress.startsWith('0x')) {
    contractAddress = `0x${contractAddress}`;
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) {
    console.error('Invalid contract address format. Ensure it starts with 0x and is 42 characters long.');
    process.exit(1);
  }

  // Verificar que la clave de API esté configurada
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) {
    console.error('ALCHEMY_API_KEY no está configurado en el archivo .env');
    process.exit(1);
  }

  const client = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),  // Usa esta URL
  });
  
  const ABI = parseAbi([
    'function winnerName() view returns (bytes32)',
  ]);

  try {
    const winnerNameBytes32 = await client.readContract({
      address: contractAddress as `0x${string}`, // Type assertion
      abi: ABI,
      functionName: 'winnerName',
    });

    const winnerName = Buffer.from(winnerNameBytes32.replace(/^0x/, ''), 'hex')
      .toString('utf8')
      .replace(/\0/g, '');

    console.log(`The winning proposal is: ${winnerName}`);
  } catch (error) {
    console.error('Error querying the results:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
