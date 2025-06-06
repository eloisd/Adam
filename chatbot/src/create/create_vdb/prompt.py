LLM_SPLITTER_PROMPT = """You are an expert in identifying semantic meaning of text. You wrap each chunk in <<<>>>.
Example:
Text: 
\"## TABLE DES MATIÈRES

1. Motivation
2. Types de graphes
3. Applications dans les graphes
4. Node embeddings
5. GNN

## HISTORIQUE DES GNN

- Les graphes attirent l'intérêt des chercheurs en mathématique et en informatique depuis très longtemps
- La première application concrète des réseaux de neurones aux graphes date de 1997 - A. Sperduti and A. Starita
- Cependant, la première référence connu au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010)
  - Ces GNN tombaient dans la catégorie des réseaux récurrents (RecGNN)
  - Ils souffrent donc des mêmes problèmes à l'entraînement!
- Les GNN sont réellement devenus populaires suite à l'adaptation de la convolution par Bruna et al (2013) - ConvGNN
- Depuis, il existe des GNN exploitant tous les types d'unité: GAE, Transformeur, etc.

## MOTIVATION

- Nous avons vu jusqu'à présent qu'il faut parfois prendre en considération le format des données afin de bien tirer avantage d'informations qui peuvent s'y cacher
  - Par exemple, les informations de nature spatiale sont particulièrement bien exploitées à l'aide des convolutions
  - Et celles de nature séquentielle/temporelle à l'aide d'unités récurrentes
- Les graphes eux incorporent de l'information relationnelle, pas toujours bien capturées par une structure en grille dont le nombre de voisins est fixé à l'avance
  - Les CNN et RNN se concentrent sur la capture d'informations d'un nœud unique (pixel, mot, etc.)
  - Ils ne capturent pas bien l'information contextuelle des nœuds voisins et de leurs liens\"

Wrapped:

<<<## TABLE DES MATIÈRES \t 1. Motivation 2. Types de graphes 3. Applications dans les graphes 4. Node embeddings 5. GNN>>>
<<<## HISTORIQUE DES GNN \t - Les graphes attirent l'intérêt des chercheurs en mathématique et en informatique depuis très longtemps>>>
<<<## HISTORIQUE DES GNN \t - La première application concrète des réseaux de neurones aux graphes date de 1997 - A. Sperduti and A. Starita>>>
<<<## HISTORIQUE DES GNN \t - Cependant, la première référence connu au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010) \t - Ces GNN tombaient dans la catégorie des réseaux récurrents (RecGNN)>>>
<<<## HISTORIQUE DES GNN \t - Cependant, la première référence connu au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010) \t - Ils souffrent donc des mêmes problèmes à l'entraînement!>>>
<<<## HISTORIQUE DES GNN \t - Les GNN sont réellement devenus populaires suite à l'adaptation de la convolution par Bruna et al (2013) - ConvGNN>>>
<<<## HISTORIQUE DES GNN \t - Depuis, il existe des GNN exploitant tous les types d'unité: GAE, Transformeur, etc.>>>
<<<## MOTIVATION \t - Nous avons vu jusqu'à présent qu'il faut parfois prendre en considération le format des données afin de bien tirer avantage d'informations qui peuvent s'y cacher \t - Par exemple, les informations de nature spatiale sont particulièrement bien exploitées à l'aide des convolutions>>>
<<<## MOTIVATION \t - Nous avons vu jusqu'à présent qu'il faut parfois prendre en considération le format des données afin de bien tirer avantage d'informations qui peuvent s'y cacher \t - Et celles de nature séquentielle/temporelle à l'aide d'unités récurrentes>>>
<<<## MOTIVATION \t - Les graphes eux incorporent de l'information relationnelle, pas toujours bien capturées par une structure en grille dont le nombre de voisins est fixé à l'avance \t - Les CNN et RNN se concentrent sur la capture d'informations d'un nœud unique (pixel, mot, etc.)>>>
<<<## MOTIVATION \t - Les graphes eux incorporent de l'information relationnelle, pas toujours bien capturées par une structure en grille dont le nombre de voisins est fixé à l'avance \t - Ils ne capturent pas bien l'information contextuelle des nœuds voisins et de leurs liens>>>

Now, process the following text:

\"{text}\"
        
"""