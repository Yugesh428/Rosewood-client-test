# Rosewood Docker Setup

## ⚠️ IMPORTANT — Always run from inside the `docker/` folder

```cmd
cd C:\Users\Acer\Desktop\RosewoodFinal\rosewood\docker
```

## Commands

### Start database + app
```cmd
docker compose up -d
```

### Run seed (create admin + themes) — run ONCE after first `up`
```cmd
docker compose run --rm seed
```

### View logs
```cmd
docker compose logs -f app
```

### Stop everything
```cmd
docker compose down
```

### Stop and delete database volume (full reset)
```cmd
docker compose down -v
```

## Admin credentials (change before production)
| Field    | Value                  |
|----------|------------------------|
| Email    | admin@rosewood.com     |
| Password | Admin@1234             |
| URL      | http://localhost:3000/admin/login |

To change credentials, edit `docker-compose.yml`:
```yaml
SEED_ADMIN_EMAIL:    "your@email.com"
SEED_ADMIN_PASSWORD: "YourPassword"
```
