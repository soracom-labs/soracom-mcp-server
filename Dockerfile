# Dockerfile to start MCP Server with npx command
FROM node:22-alpine3.20
RUN mkdir -p /home/app/soracom-mcp-server
WORKDIR /home/app/soracom-mcp-server
RUN npm install @soracom-labs/soracom-mcp-server
CMD ["npx", "@soracom-labs/soracom-mcp-server"]
