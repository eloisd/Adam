import { Injectable } from '@nestjs/common';
import { ADAM_PRESENTATION, ABOUT_ADAM_ANSWER_TEMPLATE } from './prompt';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { AIMessage } from '@langchain/core/messages';
import { ConfigService } from '@nestjs/config';
import AgentState from './agent_state';

@Injectable()
export class AboutChatbotService {
  private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
    });
  }

  /**
   * Handles questions about the chatbot or Adam
   * @param state Current agent state
   * @returns Updated state with response about Adam
   */
  async aboutChatbot(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
    console.log("Entering aboutChatbot");

    // Update the tool used
    state.tool_used = state.messages[state.messages.length - 1]?.name || "";

    try {
      // Get the necessary parameters
      const language = state.language;
      const rephrased_question = state.rephrased_question;

      // Ensure messages_ exists
      if (!state.messages_ || !Array.isArray(state.messages_)) {
        state.messages_ = [];
      }

      // Create prompt template and chain with the LLM
      const about_adam_answer_prompt = ChatPromptTemplate.fromTemplate(ABOUT_ADAM_ANSWER_TEMPLATE);

      // Invoke the LLM with the prompt and parameters
      const promptMessages = await about_adam_answer_prompt.formatMessages({
        adam_presentation: ADAM_PRESENTATION,
        question: rephrased_question,
        language: language
      });

      const response = await this.llm.invoke(promptMessages);

      // Extract the response content
      const answer_about_adam = response.text.trim();

      // Add the response to messages
      state.messages_.push(new AIMessage(answer_about_adam));

      console.log(`aboutChatbot: Generated response: ${answer_about_adam}`);
    } catch (error) {
      console.error(`Error generating response about Adam: ${error}`);

      // In case of error, provide a default response
      const default_response = "Je suis ADAM, votre Adaptive Digital Academic Mentor. Je suis ici pour vous aider à apprendre, réviser et comprendre vos cours.";

      // Ensure messages_ exists
      if (!state.messages_ || !Array.isArray(state.messages_)) {
        state.messages_ = [];
      }

      state.messages_.push(new AIMessage(default_response));

      console.log(`aboutChatbot: Using default response due to error`);
    }

    return state;
  }
}