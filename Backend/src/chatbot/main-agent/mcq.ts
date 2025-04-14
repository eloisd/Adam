import { Injectable } from '@nestjs/common';
import {
  MCQ_GENERATOR_TEMPLATE,
  MCQ_EVALUATION_TEMPLATE,
  RESPONSE_JSON_MCQ
} from './prompt';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AIMessage } from '@langchain/core/messages';
import { ConfigService } from '@nestjs/config';
import AgentState from './agent_state';

@Injectable()
export class McqService {
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Generates an MCQ based on the subject content and evaluates its quality
   * @param state Current agent state
   * @returns Updated state with the generated MCQ and its evaluation
   */
  async generateMcq(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering generateMcq");

    try {
      // Extract data from the state
      const text = state.related_subject_content;
      const number = 3;
      const tone = "difficult";
      const subject = state.related_subject;
      const rephrased_question = state.rephrased_question;
      const language = state.language;

      // Preparation of prompt templates
      const quiz_generator_prompt = ChatPromptTemplate.fromTemplate(MCQ_GENERATOR_TEMPLATE);
      const quiz_evaluation_prompt = ChatPromptTemplate.fromTemplate(MCQ_EVALUATION_TEMPLATE);

      // MCQ Generation
      const mcqPromptMessages = await quiz_generator_prompt.formatMessages({
        text: text,
        number: number,
        tone: tone,
        subject: subject,
        response_json: JSON.stringify(RESPONSE_JSON_MCQ),
        question: rephrased_question,
        language: language
      });

      const mcq_response = await this.llm.invoke(mcqPromptMessages);
      const generated_mcq = mcq_response.text.trim();

      // Add MCQ to messages
      if (!state.messages_ || !Array.isArray(state.messages_)) {
        state.messages_ = [];
      }
      state.messages_.push(new AIMessage(generated_mcq));

      // MCQ Evaluation
      const reviewPromptMessages = await quiz_evaluation_prompt.formatMessages({
        tone: tone,
        subject: subject,
        quiz: generated_mcq,
        language: language
      });

      const review_response = await this.llm.invoke(reviewPromptMessages);
      const generated_review = review_response.text.trim();

      // Add the evaluation to messages
      state.messages_.push(new AIMessage(generated_review));

      console.log(`generateMcq: rephrased_question: ${state.rephrased_question}`);
      console.log(`generateMcq: Generated MCQ: ${generated_mcq}`);
      console.log(`generateMcq: Generated review: ${generated_review}`);
    } catch (error) {
      console.error(`Error generating MCQ: ${error}`);

      // In case of error, provide a default message
      if (!state.messages_ || !Array.isArray(state.messages_)) {
        state.messages_ = [];
      }
      state.messages_.push(new AIMessage(
        "Je n'ai pas pu générer un QCM pour le moment. Veuillez réessayer ultérieurement."
      ));
    }

    return state;
  }
}