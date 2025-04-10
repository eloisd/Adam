import { Injectable } from '@angular/core';
import {Topic} from '../../core/models/topic.model';

export interface TopicGroup {
  title: string;
  topics: Topic[];
}

@Injectable({
  providedIn: 'root'
})
export class GroupTopicsService {

  constructor() { }

  public groupTopicsByDate(sortedTopics: Topic[]): TopicGroup[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastWeekDate = new Date(today);
    lastWeekDate.setDate(today.getDate() - 7);

    const last30DaysDate = new Date(today);
    last30DaysDate.setDate(today.getDate() - 30);

    const topicsByMonth = new Map<string, Topic[]>();
    const topicsByYear = new Map<number, Topic[]>();

    // Pour éviter les doublons
    const classifiedTopics = new Set<Topic>();

    const groups: TopicGroup[] = [];

    // Classer les topics dans les bonnes catégories
    for (const topic of sortedTopics) {
      const topicDate = new Date(topic.updated_at);
      topicDate.setHours(0, 0, 0, 0); // Normaliser la date sans heure

      if (topicDate.getTime() === today.getTime()) {
        this.addToGroup(groups, "Aujourd'hui", topic);
      } else if (topicDate.getTime() === yesterday.getTime()) {
        this.addToGroup(groups, "Hier", topic);
      } else if (topicDate >= lastWeekDate) {
        this.addToGroup(groups, "7 derniers jours", topic);
      } else if (topicDate >= last30DaysDate) {
        this.addToGroup(groups, "30 derniers jours", topic);
      } else {
        const monthYear = topicDate.toLocaleString("fr-FR", { month: "long", year: "numeric" });
        if (!topicsByMonth.has(monthYear)) {
          topicsByMonth.set(monthYear, []);
        }
        topicsByMonth.get(monthYear)!.push(topic);
      }

      // Marquer le topic comme classifié pour éviter les doublons
      classifiedTopics.add(topic);
    }

    // Ajouter les groupes des mois jusqu'à janvier
    const months = Array.from(topicsByMonth.keys()).sort((a, b) =>
      new Date(`01 ${b}`) > new Date(`01 ${a}`) ? 1 : -1
    );

    for (const month of months) {
      groups.push({ title: month, topics: topicsByMonth.get(month)! });
    }

    // Récupérer les topics restants pour les années
    for (const topic of sortedTopics) {
      if (classifiedTopics.has(topic)) {
        continue; // Skip déjà classé
      }

      const year = new Date(topic.updated_at).getFullYear();

      if (!topicsByYear.has(year)) {
        topicsByYear.set(year, []);
      }
      topicsByYear.get(year)!.push(topic);
    }

    // Ajouter les années dans l'ordre décroissant
    const years = Array.from(topicsByYear.keys()).sort((a, b) => b - a);
    for (const year of years) {
      groups.push({ title: `${year}`, topics: topicsByYear.get(year)! });
    }

    return groups;
  }

  private addToGroup(groups: TopicGroup[], title: string, topic: Topic) {
    let group = groups.find(g => g.title === title);
    if (!group) {
      group = { title, topics: [] };
      groups.push(group);
    }
    group.topics.push(topic);
  }
}
