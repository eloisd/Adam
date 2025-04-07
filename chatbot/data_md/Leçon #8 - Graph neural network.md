# GRAPH NEURAL NETWORKS

Par Kévin Bouchard Ph.D.
Professeur titulaire en intelligence artificielle et apprentissage automatique
Laboratoire d'Intelligence Ambiante pour la reconnaissance d'activités (LIARA)
Directeur de l'Espace innovation en technologies numériques Hydro-Québec
Président du Regroupement québécois des maladies orphelines (RQMO)
Université du Québec à Chicoutimi
www.Kevin-Bouchard.ca Kevin_Bouchard@uqac.ca 

## TABLE DES MATIÈRES
1. Motivation
2. Types de graphes
3. Applications dans les graphes
4. Node embeddings
5. GNN

## HISTORIQUE DES GNN

- Les graphes attirent l'intérêt des chercheurs en mathématique et en informatique depuis très longtemps
- La première application concrète des réseaux de neurones aux graphes date de 1997 - A. Sperduti and A. Starita
- Cependant, la première référence connue au GNN vient de Gori et al. (2005), puis de Scarselli et al. (2009) et enfin de Gallicchio et al. (2010)
- Ces GNN tombaient dans la catégorie des réseaux récurrents (RecGNN)
- Ils souffrent donc des mêmes problèmes à l'entraînement!
- Les GNN sont réellement devenus populaires suite à l'adaptation de la convolution par Bruna et al (2013) – ConvGNN
- Depuis, il existe des GNN exploitant tous les types d'unité: GAE, Transformeur, etc.

## MOTIVATION

- Nous avons vu jusqu'à présent qu'il faut parfois prendre en considération le format des données afin de bien tirer avantage d'informations qui peuvent s'y cacher
- Par exemple, les informations de nature spatiale sont particulièrement bien exploitées à l'aide des convolutions
- Et celles de nature séquentielle/temporelle à l'aide d'unités récurrentes
- Les graphes eux incorporent de l'information relationnelle, pas toujours bien capturées par une structure en grille dont le nombre de voisins est fixé à l'avance
- Les CNN et RNN se concentrent sur la capture d'informations d'un nœud unique (pixel, mot, etc.)
- Ils ne capturent pas bien l'information contextuelle des nœuds voisins et de leurs liens

L'image montre une comparaison entre les structures de type réseau (Networks) qui sont irrégulières et les structures en grille comme les images ou le texte.

## GRAPHES

- Les graphes se retrouvent naturellement un peu partout autour de nous

L'image montre différents exemples de graphes dans la vie réelle:
- Événements
- Réseaux informatiques
- Propagation de maladies
- Chaîne alimentaire
- Métro/train
- Réseaux sociaux

- Les domaines complexes possèdent une structure relationnelle riche, qui peut être représentée par un graphe relationnel
- Comment tirer avantage de la structure relationnelle?

L'image montre différents types de graphes:
- Knowledge Graphs (graphes de connaissances)
- Regulatory Networks (réseaux de régulation)
- Scene Graphs (graphes de scène)
- Code Graphs (graphes de code)
- Molecules (molécules)
- 3D Shapes (formes 3D)

## MAIS QU'EST-CE QU'UN GRAPHE?

- Un graphe est une structure G = (V, E) définie par un ensemble de nœuds V et d'arêtes E entre ces nœuds
- Une arête allant de v ∈ V vers un nœud u ∈ V se définit comme (v, u) ∈ E
- Les nœuds peuvent être creux ou encore posséder une structure
  - La structure peut être un ensemble de caractéristiques
  - E.g.: réseau social, le nœud représente un utilisateur et ses caractéristiques les activités de l'utilisateur sur le réseau
- Les arêtes peuvent avoir une direction, un poids et possiblement lier un nœud à lui-même
  - Elles peuvent même avoir leurs propres caractéristiques!

## MATRICE D'ADJACENCE

- Les graphes peuvent être représentés sous un format facile à utiliser qu'on appelle la matrice d'adjacence
- Celle-ci est généralement concaténée à l'ensemble des vecteurs de caractéristiques des nœuds
- La matrice d'adjacence d'un réseau est A ∈ ℝ^(|V|×|V|)
  - |V| est le nombre de nœuds dans le graphe
  - Celle-ci est initialisée avec des 0
- Nous présentons simplement la présence d'un lien avec A[v,u] = 1 si (v,u) ∈ E

## TYPES DE GRAPHE ET LEUR MATRICE D'ADJACENCE

L'image montre différents types de graphes et leurs matrices d'adjacence correspondantes:
- Directed graph G(V,E) - Graphe dirigé
- Undirected graph G(V,E) - Graphe non dirigé
- Knowledge graph G(V,E) - Graphe de connaissances
- Weighted graph G(V,E) - Graphe pondéré

Pour chaque type, la matrice d'adjacence correspondante est affichée.

## TÂCHES POSSIBLES

Les différentes tâches possibles avec les graphes incluent:
- Prédiction de graphes
- Génération de graphes
- Classification de nœuds
- Prédiction de nœuds
- Prédiction de liens
- Prédiction de sous-ensembles de graphes

L'image illustre ces différentes tâches sur un graphe.

## ALPHAFOLD: PRÉDICTION DE NŒUDS

- Prédire de manière computationnelle la structure 3D d'une protéine uniquement à partir de sa séquence d'acides aminés
- Pour chaque nœud, prédire ses coordonnées 3D
- L'idée est d'utiliser un graphe spatial
  - Nœuds: Acides aminés dans une séquence de protéines
  - Arêtes: Proximité entre les acides aminés

L'image montre le pipeline d'AlphaFold avec les prédictions de structure de protéines.

## RECOMMANDATION: PRÉDICTION DE LIENS

- Les utilisateurs interagissent avec des articles
  - Regarder des films, acheter des produits dérivés, écouter de la musique
  - Nœuds: Utilisateurs et articles
  - Arêtes: Interactions utilisateur-article
- Objectif: Recommander des articles que les utilisateurs pourraient aimer

L'image montre un graphe biparti avec des utilisateurs (Users) connectés à des items, avec des interactions existantes et des recommandations potentielles ("You might also like").

## INTERACTION DE MÉDICAMENTS

- De nombreux patients prennent plusieurs médicaments pour traiter des maladies complexes ou coexistantes
- Tâche: Étant donné une paire de médicaments, prédire les effets secondaires indésirables
  - Nœuds: médicaments et protéines
  - Arêtes: interactions

L'image montre un graphe d'interactions médicamenteuses avec différents médicaments (triangles) et protéines (cercles) ainsi que leurs interactions.

## TRAFFIC: PRÉDICTIONS DE GRAPHES

- Nœuds: segments de route
- Arêtes: connectivité entre les segments de route

L'image montre une carte routière et comment les données de trafic peuvent être représentées sous forme de graphe.

Avec leur approche basée sur les GNN, DeepMind a significativement amélioré les prédictions de trafic! L'image montre les améliorations d'ETA (temps d'arrivée estimé) de Google Maps dans différentes villes du monde, allant de 16% à 51%.

## OUTILS POPULAIRES

- PyTorch Geometric
  - Expressément pour PyTorch
  - Bon nombre de cours et tutoriaux: https://pytorch-geometric.readthedocs.io/en/latest/get_started/colabs.html
- Deep Graph Library
  - Fonctionne avec PyTorch, Tensorflow et Apache MXNet
  - https://www.dgl.ai/

## NODE EMBEDDING

Il s'agit d'encoder les nœuds dans un espace latent!

### POURQUOI?

- La similarité entre les embeddings de plusieurs nœuds indique leur similarité dans le réseau
- Cela permet d'encoder automatiquement l'information du réseau
- Pour un graphe G(V,E) avec V nœuds et E arêtes
  - Des nœuds v₁, v₂ auront des embeddings plus proches dans l'espace vectoriel à faible dimension
- Peut donc servir à différents types de tâches liés aux graphes
  - Classification de nœuds
  - Prédiction de liens
  - Classification de graphes
  - Etc.

L'image montre la transformation d'un graphe original en vecteurs dans un espace latent de faible dimension.

## COMPOSANTS CLÉS

- Nous avons besoin d'un encodeur Enc(v) = z_v
  - Sa version la plus simple est d'avoir une matrice Z ∈ ℝ^(d×|V|)
  - C'est elle que nous devons apprendre!
- Une fonction de similarité ou une distance
  - La similarité cosinus
  - Une des distances de Minkowski
  - Ou encore plus simplement le produit scalaire (dot product): a·b = ∑aᵢbᵢ
- Nous couvrirons les encodeurs profonds par la suite avec nos GNN

L'image montre la structure d'une matrice d'embedding Z avec ses différentes composantes.

## MÉTHODES D'ENCODAGE

- Les méthodes sans caractéristiques sont dites par proximité
  - On trouve les marches aléatoires (Random Walk)
  - Ou encore les marches biaisées (Biased Random Walk)
  - Nos embeddings seront indépendants de la tâche, ce qui est avantageux pour la généralisation
  - De plus, ils sont entraînés par auto-apprentissage ou apprentissage non-supervisé
- Les méthodes basées sur les caractéristiques sont plus classiques:
  - Autoencodeurs profonds → on peut entraîner un AE pour compresser les attributs
  - Factorisation matricielle → on peut utiliser la décomposition en valeur singulière pour factoriser une matrice d'attributs des nœuds en dimension inférieure

## RANDOM WALK

- Supposons le vecteur z_u et la probabilité P(v|z_u) de visiter un nœud v au hasard en partant de u
- z_u^T z_v ≈ la probabilité que v et u co-apparaissent lors d'une marche aléatoire
1. Estimer la probabilité P(v|u) avec une marche aléatoire fixe et limitée (courte)
2. Pour chaque nœud u, gardons N_R(u) l'ensemble des nœuds visités (avec répétitions)
3. Optimiser les embeddings pour encoder ces statistiques de marche aléatoire
- On peut faire ceci simplement en minimisant le négatif des probabilités log (similaire à notre NLLL):
  ℒ = ∑_(u∈V) ∑_(v∈N_R(u)) -log(P(v|z_u))
- On utilise les mêmes techniques: rétropropagation et gradient!

L'image montre le concept de marche aléatoire dans un graphe et comment les probabilités P_R(v|u) sont liées aux angles entre les vecteurs d'embedding.

## APPRENTISSAGE

- Avec cette technique, ce sont vraiment les embeddings z ∈ Z que nous cherchons à trouver
- Il faut initialiser z_u ∀u ∈ V avec des valeurs aléatoires (e.g. uniforme -1..1)
- Ensuite, pour un certain nombre d'itérations ou jusqu'à convergence
  - Pour tout nœud u
    - Nous calculons la dérivée partielle ∂ℒ/∂z_u
    - Faisons un pas opposé à la dérivée z_u = z_u - η(∂ℒ/∂z_u)
- DeepWalk (2013): https://arxiv.org/abs/1403.6652

## BIASED RANDOM WALK

- On peut améliorer cette idée en ajoutant de l'échantillonnage et en biaisant la marche aléatoire
- Il existe toutes sortes de stratégies pour trouver le voisinage des nœuds, mais regardons Node2Vec qui combine BFS et DFS
- L'idée est d'avoir une bonne balance entre la vue locale et la vue globale du graphe
  - Si limite à taille 3 N_BFS(u) = {s₁, s₂, s₃} alors que N_DFS(u) = {s₄, s₅, s₆}
  - Les deux ont une vue limitée!
- Avec Node2Vec, nous utilisons le paramètre de retour p pour revenir au nœud précédent
  - Et le paramètre de ratio (BFS/DFS) q pour revenir vers le nœud précédent ou s'en éloigner

L'image montre la différence entre les parcours BFS (flèches rouges) et DFS (flèches bleues) dans un graphe.

## NODE2VEC

- Ici on arrive de t vers v et le graphique montre les probabilités de transition vers chaque nœud voisin
  - N_R(u) sont les nœuds visités par la marche biaisée
  - Si p petit alors similaire à BFS
  - Si q petit alors similaire à DFS

L'image montre comment les paramètres α affectent les probabilités de transition entre les nœuds.

- Dans l'implémentation, la partie Node2Vec sert à construire le dataset pour appliquer directement un Word2Vec
- https://github.com/aditya-grover/node2vec

L'image montre le pipeline complet: graphe original → marches aléatoires → encodeur (SkipGram) → vecteurs latents.

## EN RÉSUMÉ

- Idée principale: Représenter les nœuds de façon à ce que les distances dans l'espace vectoriel reflètent les similarités entre les nœuds dans le réseau d'origine
- Différentes notions de similarité entre les nœuds:
  - Naïve: Similaires si deux nœuds sont connectés
  - Approches basées sur les marches aléatoires
- Clustering: on applique notre algorithme favori sur les z_i ∈ Z
- Classification de nœud: Entraîne un classeur à prédire l'étiquette du nœud i à partir de z_i en constituant un dataset X = [[z_i,1, z_i,2, ...][z_j,1, z_j,2, ...] ...], y
- Prédiction d'arête: prédire l'arête (i,j) à partir de (z_i, z_j)

## GRAPHE EMBEDDING?

- Comment peut-on directement faire un embedding pour des structures de graphes entiers?
  - I.e.: Transformer le graphe G en z_G afin de faire des tâches liées à la structure
  - E.g.: Classification de la toxicité des molécules
- Méthodes naïves:
  - Utilisation du node embedding et moyenne z_G = ∑_(v∈G) z_v
  - Introduire un "nœud virtuel" pour représenter le (sous-)graphe et appliquer une technique standard d'embedding de graphe.

L'image montre l'approche DiffPool qui utilise un clustering hiérarchique + moyenne des embeddings de nœuds.

## GRAPH NEURAL NETWORK

Les embeddings creux comportent quelques limitations...
Il faut O(|V|d) paramètres minimums et il n'y a aucun partage entre les nœuds; les nœuds ont nécessairement une représentation unique

## LIMITES

- Si le nœud 5 est ajouté suite à l'entraînement, nous ne pouvons pas trouver son embedding
  - Très commun dans les problèmes réels
  - E.g.: ajout d'un utilisateur dans un réseau social
- Même si les nœuds 2 et 12 sont similaires structurellement, on ne capture pas cette information
  - Ils ont des embeddings très différents
- On ne peut pas exploiter les caractéristiques avec les méthodes vues
  - Pas très pratique en machine learning!

L'image montre deux cas problématiques: un nouveau nœud 5 ajouté à un graphe existant, et deux nœuds structurellement similaires (2 et 12) dans des positions différentes du graphe.

## PROPRIÉTÉ DÉSIRABLE

- La représentation de graphes devrait être la même pour deux ordres de plan
  - Réfère à l'ordre de visite des voisins
  - Pour |V| nœuds, |V|! plans possibles
- Si nous apprenons une fonction f qui associe un graphe G = (A, X) à un vecteur ℝ^d
  - f(A₁,X₁) = f(A₂, X₂) - A et X sont généralement concaténés!
  - X est la matrice de caractéristiques de nœuds
  - A est la matrice d'adjacence vue précédemment

L'image montre deux ordres de plan différents pour le même graphe.

## ÉTAPES GÉNÉRIQUES

Les étapes génériques pour les GNN incluent:
1. Trouver la structure du graphe
2. Spécifier le type et l'échelle du graphe
3. Concevoir la fonction de perte
4. Construire le modèle avec des modules computationnels:
   - Module de sampling
   - Opérateur de convolution/récurrent
   - Opérateur de pooling
   - Skip connection

L'image montre un pipeline complet allant de l'entrée (graphe) jusqu'à la sortie (embeddings et fonction de perte).

## INTUITION: AGRÉGATION DU VOISINAGE

- Générer l'embedding à partir du voisinage local

L'image montre comment l'information d'un nœud cible est agrégée à partir de ses voisins.

- Chaque nœud définit un graphe de calcul selon son voisinage
- Réseaux de neurones appliqués sur ces graphes de calcul

L'image montre comment les réseaux de neurones sont appliqués sur les graphes de calcul générés pour chaque nœud.

L'équation fondamentale de l'agrégation est:

h_v^(k+1) = φ(W_k ∑_(u∈N(v)) h_u^(k)/|N(v)| + B_k h_v^(k)), ∀k ∈ {0, ..., K-1}

Où:
- h_v^0 = x_v (caractéristiques du nœud v)
- z_v = h_v^(K) (embedding final après K couches)
- φ est une activation non-linéaire
- W_k, B_k sont des matrices de poids apprenables
- ∑_(u∈N(v)) h_u^(k)/|N(v)| est la moyenne des embeddings des voisins (invariant aux permutations)
- K est le nombre total de couches

## GNN INVARIANCE

- Avec un nœud spécifique, on considère que les GNN sont invariables aux permutations
  - Poids partagés entre les nœuds
  - Moyenne des embeddings des voisins - invariable aux permutations

L'image montre comment un nœud cible agrège l'information de ses voisins de manière invariante aux permutations.

## GNN ÉQUIVARIANCE

- En considérant tous les nœuds, on dit qu'ils sont équivariant par permutation
  - Si on permute l'entrée, la sortie est également permutée de manière correspondante

L'image montre deux plans d'ordre différents pour le même graphe, avec les matrices de caractéristiques et d'adjacence correspondantes, et comment les embeddings sont permutés en conséquence.

1. Les lignes des caractéristiques d'entrée des nœuds et les embeddings de sortie sont alignés
2. Nous savons que le calcul de l'embedding d'un nœud donné avec GNN est invariant
3. Donc, après permutation, la position d'un nœud donné dans la matrice de caractéristiques d'entrée est modifiée, et l'embedding de sortie d'un nœud donné reste le même (les couleurs des caractéristiques du nœud et de l'embedding sont associées)

- Attention! En pratique, ce n'est pas toujours strictement vrai dû à la dépendance des caractéristiques

## CONVOLUTIONS

- Un CNN peut être considéré comme un cas spécifique de GNN
- Par exemple, une couche d'un CNN peut être formulée comme:
  h_v^(l+1) = φ(∑_(u∈N(v)∪v) W_l^u h_u^(l))
- Où N(v) représente les 8 pixels voisin de v pour une convolution 3 × 3
- La différence clé est que le CNN a un voisinage de taille fixe et suit un ordre spécifique!
- Le CNN n'est pas invariant/équivariant aux permutations!
  - Changer l'ordre des voisins peut changer la sortie (avec raison)!

L'image montre la différence entre les structures régulières des images et les structures irrégulières des graphes.

- Cependant, pour les cas spécifiques gérables par les CNN ne nous aident pas vraiment avec nos graphes pour les raisons évoquées en début de présentation
- Ainsi, les GNN les plus communs utilisent leur propre version de l'opération de convolution

h_v^(k+1) = φ(W_k ∑_(u∈N(v)∪v) h_u^(k)/√(|N(u)||N(v)|))

- ConvGNN pour classification de nœuds
  - Chaque couche de conv, agrège l'information du voisinage
  - La représentation finale contient de l'information des voisinages plus éloignés

L'image montre l'architecture d'un GNN à convolution avec des couches Gconv suivies d'activations ReLU.

## EXEMPLE

- L'ensemble de données Cora comprend des publications scientifiques classées sous 7 classes
- Le graphe comprend 5429 arêtes liant les articles par leurs citations
- Chaque nœud est une publication contenant des 0/1 pour la présence ou l'absence de chacun des 1433 mots uniques
  - Il s'agit de la longueur du vecteur de caractéristiques!
- Voir le code de GCN vanille

L'image montre un tableau avec les caractéristiques des nœuds du dataset Cora.

- Ce GCN suppose qu'il n'y a pas de features sur les arêtes!
- Il a features × units + bias poids
- Soit 1433 × 16 + 16 = 22944 et 16 × 7 + 7 = 119

Le code montre l'implémentation d'un GCN pour le dataset Cora, avec deux couches de convolution et une normalisation log_softmax.

## RETOUR À LA CONCEPTION

## ENTRAÎNEMENT DES GNN

- De façon supervisée, nous minimisons simplement ℒ(y, f_Θ(z_v))
  - La perte peut être la SSE si y est continue
  - Sinon la cross entropie si y est discret
  - Θ représente la totalité des paramètres à apprendre

ℒ = -∑_(v∈V) [y_v log(σ(z_v^T θ)) + (1-y_v)log(1-σ(z_v^T θ))]

L'image montre le processus d'entraînement avec des nœuds de graphe et leurs embeddings.

## CONCEPTION

- Nous avons vu rapidement tout à l'heure les principaux éléments pour la conception des GNN
- En réalité, la clé et la variété se situent au niveau de l'agrégation
- On peut même dire que concrètement, c'est celle-ci qui fait d'un GNN un GNN!

Les deux étapes principales sont:
1. Définir une fonction d'agrégation de voisinage
2. Choisir une fonction de perte sur les embeddings pour l'optimisation avec rétropropagation

- On construit dynamiquement les graphes de calcul des nœuds d'entraînement
  - Ils sont hétérogènes!

L'image montre comment différents graphes de calcul sont construits pour différents nœuds.

- De la même façon que pour les CNN et les RNN, les GNN partagent leurs paramètres
- Ce partage permet d'avoir des graphes de calcul hétérogènes et générés dynamiquement!
- De plus, il permet de généraliser à des nouveaux nœuds!

L'image montre le partage de paramètres entre différents graphes de calcul.

## SAMPLING MODULE

- Un inconvénient majeur de la plupart des architectures de GNN est leur évolutivité
- En général, le vecteur de caractéristiques de chaque nœud dépend de l'intégralité de son voisinage
- Cela peut s'avérer inefficace pour les graphes gigantesques avec des voisinages importants
- Pour résoudre ce problème, des modules d'échantillonnage ont été intégrés
- L'idée principale des modules d'échantillonnage est qu'au lieu d'utiliser toutes les informations de voisinage, on peut en échantillonner un sous-ensemble pour effectuer la propagation

## EXEMPLE GRAPHSAGE

- Un des premiers à introduire l'échantillonnage
  - Implémenté sur Tensorflow avec Adam
  - Testé sur le dataset Reddit (232 925 sujets avec une étiquette correspondant à 50 communautés et des liens entre les sujets si un user est en commun)

L'image montre les trois étapes de GraphSAGE: échantillonnage du voisinage, agrégation des informations, prédiction.

- Le point délicat est que nous entraînons également la fonction d'agrégation en même temps que nos matrices de poids apprenables
- Les auteurs ont expérimenté 3 fonctions d'agrégation différentes:
  - un agrégateur de moyenne
  - un agrégateur LSTM
  - un agrégateur max pooling
- Dans les 3 cas, les fonctions contiennent des paramètres appris qui sont optimisés pendant l'entraînement
- De cette façon, le réseau apprendra lui-même la "bonne" manière d'agréger les caractéristiques des nœuds échantillonnés

## EXEMPLE PINSAGE

- PinSAGE effectue les conv sur l'échantillonnage du voisinage des nœuds et construit dynamiquement les réseaux
- Exploite une architecture MapReduce pour distribuer le modèle entraîné afin de pouvoir générer des embeddings pour des milliards de nœuds
- γ est une fonction de pooling d'importance

L'image montre l'algorithme CONVOLVE de PinSAGE et son application sur des graphes.

## POOLING OPERATOR

- Les opérateurs de pooling dans les GNN servent à résumer les informations d'un ensemble de nœuds voisins en une représentation plus concise
- Ils sont intimement liés aux approches d'échantillonnage que nous venons de voir
  - Souvent on ne fait la distinction que l'étape où c'est appliqué (avant ou après la conv)
- Les opérateurs de pooling visent à réduire le nombre de voisins pris en compte en sélectionnant ou en résumant les informations d'un sous-ensemble de voisins échantillonnés
- Après qu'un nœud a agrégé les messages de ses voisins, l'opérateur de pooling condense ces informations en une seule représentation
  - C'est intuitivement la même chose que pour nos CNN!

- Dans les GNN, on parle souvent de passage de message
- L'idée est qu'on part d'un ensemble d'embeddings de voisinage {h_v, ∀v ∈ N(u)}
  - Le fait que ce soit un ensemble est important: il n'y a pas d'ordre!
  - Donc, on maintient la contrainte d'être invariable aux permutations
- Et nous voulons l'associer à un vecteur unique m_(N(u))
- Zaheer et al. (2017) a montré que m_(N(u)) = MLP_θ(∑_(v∈N(u)) MLP_φ(h_v)) est un approximateur universel d'ensemble pour les GNN
  - Cependant, en pratique, c'est lourd!
  - De plus, on risque de tomber en surapprentissage si le MLP est profond
  - Cette approche, de set pooling en pratique ne fait qu'ajouter une couche dense à l'agrégation

Types de pooling:
- Flat Pooling
  - SumPool: des représentations de nœuds
  - AvgPool: des représentations de nœuds
  - Plus simple, plus rapide, mais perte d'information
- Pooling hiérarchique
  - Clustering (e.g. DiffPool, MemPool)
  - Node Drop: supprime les nœuds avec un score de signification faible (e.g. AttPool, TopKPool)

L'image montre différentes approches de pooling pour GNN.

## SKIP-CONNECTION

- Un des problèmes des GNN vient du fait que l'agrégation provoque un lissage excessif (over-smoothing)
  - L'encodage dépend trop fortement de l'agrégation plutôt que de la représentation des nœuds aux couches précédentes
  - Les nœuds deviennent trop similaires!
- La skip-connection est conceptuellement similaire à nos modules résiduels
- On peut simplement concaténer (GraphSAGE):
  UPDATE_concat(h_v, m_(N(v))) = [UPDATE_base(h_v, m_(N(v)))⊕h_v]
- On peut aussi faire quelque chose de plus complexe tel que de l'interpolation:
  UPDATE_interpolate(h_v, m_(N(v))) = α₁∘UPDATE_base(h_v, m_(N(v))) + α₂
  - ∘ multiplication par élément

## GNN ET SES TÂCHES

L'image illustre les trois principales tâches des GNN:
- Node classification (Classification de nœuds): Z_i = f(h_i)
- Graph classification (Classification de graphes): Z_G = f(∑_i h_i)
- Link classification/prediction (Classification/prédiction de liens): Z_ij = f(h_i, h_j, e_ij)

Ces tâches utilisent les représentations latentes (embeddings) H créées par le GNN à partir des données d'entrée (X, A).

## DIVERSITÉ DES GNN

- Comme vous pouvez voir, il existe maintenant une très grande diversité dans les GNN
- On trouve des réseaux avec attention
- Avec transformeurs
- Diffusion, etc.
- En fait, cette image résume un petit pourcentage des principaux GNN des 5-10 dernières années!

L'image montre un arbre taxonomique des différentes architectures GNN, organisées selon:
- Module de propagation (Propagation Module):
  - Opérateur de convolution (Convolution Operator): Spectral, Spatial
  - Opérateur récurrent (Recurrent Operator): Convergence, Gate
  - Skip Connection
- Module d'échantillonnage (Sampling Module): Node, Layer, Subgraph
- Module de pooling (Pooling Module): Direct, Hierarchical

Chaque catégorie contient plusieurs implémentations spécifiques comme GCN, GraphSAGE, GAT, MPNN, etc.

## POUR ALLER PLUS LOIN...

- Le cours de Stanford CS224 est disponible en ligne gratuitement
  - Il contient 19 séances de cours sur l'exploitation des graphes en apprentissage automatique avec emphase sur les GNN
  - https://web.stanford.edu/class/cs224w/
- Le livre
  - Le cours CS224 se base principalement sur ce livre
  - Il inclut des informations sur l'entraînement
  - https://www.cs.mcgill.ca/~wlh/grl_book/files/GRL_Book.pdf
- Autres bons liens:
  - Architectures de GNN en résumé: https://theaisummer.com/gnn-architectures/
  - Résumé des GNN: https://www.sciencedirect.com/science/article/pii/S2666651021000012
