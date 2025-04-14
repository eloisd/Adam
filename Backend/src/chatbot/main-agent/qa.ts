import { Injectable } from '@nestjs/common';
import { QA_GENERATOR_TEMPLATE, QA_EVALUATION_TEMPLATE, RESPONSE_JSON_QA } from './prompt';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AIMessage } from '@langchain/core/messages';
import { ConfigService } from '@nestjs/config';
import AgentState from './agent_state';

@Injectable()
export class QaService {
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateQa(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering generateQa");

    const text = state.related_subject_content;
    const number = 3;
    const tone = "difficult";
    const subject = state.related_subject;
    const rephrased_question = state.rephrased_question;
    const language = state.language;

    const qa_generator_prompt = ChatPromptTemplate.fromTemplate(QA_GENERATOR_TEMPLATE);
    const qa_evaluation_prompt = ChatPromptTemplate.fromTemplate(QA_EVALUATION_TEMPLATE);

    try {
      const qa_chain = qa_generator_prompt.pipe(this.llm);
      const response = await qa_chain.invoke({
        text,
        number,
        tone,
        subject,
        response_json: RESPONSE_JSON_QA,
        question: rephrased_question,
        language
      });

      const generated_qa = response.text.trim();
      state.messages_.push(new AIMessage(generated_qa));

      const qa_review_chain = qa_evaluation_prompt.pipe(this.llm);
      const reviewResponse = await qa_review_chain.invoke({
        tone,
        subject,
        quiz: generated_qa,
        language
      });

      const generated_review = reviewResponse.text.trim();
      state.messages_.push(new AIMessage(generated_review));

      console.log(`generateQa: rephrased_question: ${state.rephrased_question}`);
      console.log(`generateQa: Generated Q&A: ${generated_qa}`);
      console.log(`generateQa: Generated review: ${generated_review}`);
    } catch (error) {
      console.error(`Error generating Q&A: ${error}`);

      // Fallback response in case of error
      state.messages_.push(new AIMessage(
        "I couldn't generate the Q&A questions at the moment. Please try again later."
      ));
    }

    return state;
  }
}