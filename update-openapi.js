const fs = require('fs');
const path = require('path');

const yamlPath = '\\\\wsl$\\Ubuntu\\home\\administrator\\web\\statman\\packages\\api-spec\\openapi.yaml';
let content = fs.readFileSync(yamlPath, 'utf8');

const pathsToInject = `
  /discovery/home:
    get:
      operationId: getHomeDiscovery
      summary: Retrieve data for the mobile Home screen
      tags: [discovery]
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                required: [data]
                properties:
                  data:
                    $ref: '#/components/schemas/HomeDiscoveryResponse'
  /discovery/explore:
    get:
      operationId: getExploreDiscovery
      summary: Retrieve data for the mobile Explore screen
      tags: [discovery]
      parameters:
        - name: cursor
          in: query
          schema:
            type: string
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: query
          in: query
          schema:
            type: string
        - name: sort
          in: query
          schema:
            type: string
            enum: [recent, popular, performance, featured]
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                required: [data]
                properties:
                  data:
                    $ref: '#/components/schemas/ExploreDiscoveryResponse'
  /players/{playerId}/aggregate:
    get:
      operationId: getPlayerAggregate
      summary: Get an aggregated player profile view
      tags: [players]
      parameters:
        - name: playerId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                required: [data]
                properties:
                  data:
                    $ref: '#/components/schemas/AthleteAggregateResponse'
        '404':
          $ref: '#/components/responses/NotFound'
  /games/{gameId}/spectator:
    get:
      operationId: getGameSpectator
      summary: Get game spectator view
      tags: [games]
      parameters:
        - name: gameId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                required: [data]
                properties:
                  data:
                    $ref: '#/components/schemas/GameSpectatorResponse'
        '404':
          $ref: '#/components/responses/NotFound'
`;

const componentsToInject = `
    ShareMetadata:
      type: object
      required: [canonicalUrl, shareTitle, shareText]
      properties:
        canonicalUrl:
          type: string
        shareTitle:
          type: string
        shareText:
          type: string
        imageUrl:
          type: string

    HomeDiscoveryResponse:
      type: object
      properties:
        heroItem:
          type: object
          properties:
            id: { type: string }
            type: { type: string }
            title: { type: string }
            subtitle: { type: string }
            imageUrl: { type: string }
            actionUrl: { type: string }
        trendingAthletes:
          type: array
          items:
            $ref: '#/components/schemas/PlayerSummary'
        recentBigGames:
          type: array
          items:
            $ref: '#/components/schemas/GameSummary'
        newCards:
          type: array
          items:
            $ref: '#/components/schemas/CardTemplateSummary'
        leaderboardTeaser:
          type: array
          items:
            type: object
            properties:
              rank: { type: integer }
              player: { $ref: '#/components/schemas/PlayerSummary' }
              score: { type: string }

    ExploreDiscoveryResponse:
      type: object
      properties:
        athletes:
          type: array
          items:
            $ref: '#/components/schemas/PlayerSummary'
        teams:
          type: array
          items:
            $ref: '#/components/schemas/TeamSummary'
        games:
          type: array
          items:
            $ref: '#/components/schemas/GameSummary'
        cards:
          type: array
          items:
            $ref: '#/components/schemas/CardTemplateSummary'
        nextCursor:
          type: string

    AthleteAggregateResponse:
      type: object
      properties:
        player:
          $ref: '#/components/schemas/PlayerDetail'
        recentGames:
          type: array
          items:
            $ref: '#/components/schemas/GameSummary'
        recentMedia:
          type: array
          items:
            $ref: '#/components/schemas/MediaAsset'
        relatedCards:
          type: array
          items:
            $ref: '#/components/schemas/CardTemplateSummary'
        recentActivity:
          type: array
          items:
            type: object
            properties:
              type: { type: string }
              description: { type: string }
              date: { type: string, format: date-time }
        shareMetadata:
          $ref: '#/components/schemas/ShareMetadata'

    GameSpectatorResponse:
      type: object
      properties:
        game:
          $ref: '#/components/schemas/GameDetail'
        topPerformers:
          type: array
          items:
            $ref: '#/components/schemas/GameStatLine'
        timelineEvents:
          type: array
          items:
            $ref: '#/components/schemas/GameEvent'
        mediaSummary:
          type: array
          items:
            $ref: '#/components/schemas/MediaAsset'
        shareMetadata:
          $ref: '#/components/schemas/ShareMetadata'
`;

// Insert paths before components:
content = content.replace('components:\n', pathsToInject + '\ncomponents:\n');

// Insert schemas into components/schemas
content = content.replace('schemas:\n', 'schemas:\n' + componentsToInject + '\n');

fs.writeFileSync(yamlPath, content);
console.log('Successfully updated openapi.yaml');
