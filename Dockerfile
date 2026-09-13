FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/SundarEmbroidery.Api/SundarEmbroidery.Api.csproj", "src/SundarEmbroidery.Api/"]
COPY ["src/SundarEmbroidery.Application/SundarEmbroidery.Application.csproj", "src/SundarEmbroidery.Application/"]
COPY ["src/SundarEmbroidery.Domain/SundarEmbroidery.Domain.csproj", "src/SundarEmbroidery.Domain/"]
COPY ["src/SundarEmbroidery.Infrastructure/SundarEmbroidery.Infrastructure.csproj", "src/SundarEmbroidery.Infrastructure/"]
RUN dotnet restore "src/SundarEmbroidery.Api/SundarEmbroidery.Api.csproj"

COPY . .
RUN dotnet publish "src/SundarEmbroidery.Api/SundarEmbroidery.Api.csproj" \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 10000

ENTRYPOINT ["sh", "-c", "dotnet SundarEmbroidery.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]
