# syntax=docker/dockerfile:1.7

###############################################################################
# Build stage — gebruikt het .NET 10 SDK image om het project te publishen.
# Restore zit in een aparte layer zodat Docker hem cached zolang de csproj
# niet verandert — scheelt veel build-tijd bij codewijzigingen.
###############################################################################
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS builder
WORKDIR /src

# 1) Eerst alleen de csproj kopieren en restore draaien (cache layer).
COPY Vuur.Api.csproj ./
RUN dotnet restore Vuur.Api.csproj

# 2) Daarna de rest van de source kopieren en publishen.
COPY . ./
RUN dotnet publish Vuur.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

###############################################################################
# Runtime stage — slank ASP.NET runtime image, draait als non-root.
###############################################################################
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runner
WORKDIR /app

# Default env voor productie. Compose kan deze nog overschrijven.
ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:8080 \
    DOTNET_RUNNING_IN_CONTAINER=true

# De officiele .NET runtime images bevatten al een non-root 'app' user.
# We hoeven die alleen te activeren - en chown te doen tijdens de copy.
COPY --from=builder --chown=app:app /app/publish ./

USER app

EXPOSE 8080

ENTRYPOINT ["dotnet", "Vuur.Api.dll"]
