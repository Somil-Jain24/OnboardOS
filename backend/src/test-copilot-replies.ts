import { CopilotService } from './services/copilotService';

async function testCopilotQueries() {
  const questions = [
    'Why does AWS need approval?',
    'Why is Jira blocked?',
    'Am I Day-1 ready?',
    'What should I do next?',
    'Summarise this onboarding',
    'hello how are you',
    'kya hal chal',
    'who is my manager?',
  ];

  console.log('🧪 Testing CopilotService responses...\n');

  for (const q of questions) {
    try {
      const res = await CopilotService.answerQuestion('emp-rahul', q, 'EMPLOYEE');
      console.log(`========================================`);
      console.log(`❓ Question: "${q}"`);
      console.log(`📌 Source: ${res.source}`);
      console.log(`💬 Answer: ${res.answer}`);
      console.log(`👉 Action: ${res.recommendedAction}`);
      console.log(`========================================\n`);
    } catch (e: any) {
      console.error(`Error on "${q}":`, e.message);
    }
  }
}

testCopilotQueries();
