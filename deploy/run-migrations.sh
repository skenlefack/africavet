#!/bin/bash
set -e

# Source environment variables
set -a
source /home/ubuntu/africavet/.env
set +a

echo "=== Testing DB connection ==="
sudo docker exec -i africavet-db mysql -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SELECT 1 as connection_test"

echo ""
echo "=== Running migrations ==="
for migration in $(ls -1 /home/ubuntu/africavet/migrations/*.sql 2>/dev/null | sort); do
    fname=$(basename "$migration")
    echo "Applying: $fname"
    sudo docker exec -i africavet-db mysql -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < "$migration" 2>/dev/null && echo "  OK" || echo "  (skipped or already applied)"
done

echo ""
echo "=== Checking tables ==="
sudo docker exec -i africavet-db mysql -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" -e "SHOW TABLES" 2>/dev/null | head -30

echo ""
echo "=== Done ==="
