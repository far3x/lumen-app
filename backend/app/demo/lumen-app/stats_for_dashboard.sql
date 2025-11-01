-- This script populates a business account with realistic-looking fake data for demonstration purposes.
-- It is now robust and will work even on an empty database.

BEGIN;

-- --- CONFIGURATION ---
-- Company ID is set to 2 as requested.
DO $$
DECLARE
    target_company_id INT := 2; -- Your Company ID
BEGIN
    -- Update company with a healthy token balance for demo
    UPDATE companies
    SET token_balance = 25000000 -- 25 Million tokens
    WHERE id = target_company_id;

    -- Clean up any previous fake data from this script to allow re-running
    DELETE FROM api_key_usage_events WHERE api_key_id IN (SELECT id FROM api_keys WHERE key_prefix IN ('prod1a2b', 'stag3c4d', 'ds5e6f', 'arch7g8h'));
    DELETE FROM api_keys WHERE key_prefix IN ('prod1a2b', 'stag3c4d', 'ds5e6f', 'arch7g8h');

    -- Insert 4 API keys for the target company
    RAISE NOTICE 'Inserting fake API keys for company %', target_company_id;
    INSERT INTO api_keys (name, key_prefix, key_hash, company_id, is_active, created_at, last_used_at) VALUES
    ('Production Model', 'prod1a2b', 'hash_for_prod_key_1', target_company_id, true, NOW() - INTERVAL '4 months', NOW() - INTERVAL '1 day'),
    ('Staging API', 'stag3c4d', 'hash_for_staging_key_2', target_company_id, true, NOW() - INTERVAL '3 months', NOW() - INTERVAL '3 days'),
    ('Data Science Team', 'ds5e6f', 'hash_for_datasci_key_3', target_company_id, true, NOW() - INTERVAL '2 months', NOW() - INTERVAL '1 week'),
    ('Archived Key (Legacy)', 'arch7g8h', 'hash_for_archived_key_4', target_company_id, false, NOW() - INTERVAL '6 months', NOW() - INTERVAL '2 months');
END $$;

-- --- DATA GENERATION ---
DO $$
DECLARE
    target_company_id INT := 2; -- Your Company ID
    prod_key_id INT;
    staging_key_id INT;
    datasci_key_id INT;
BEGIN
    RAISE NOTICE 'Generating fake usage data...';
    -- Get the IDs of the newly created keys
    SELECT id INTO prod_key_id FROM api_keys WHERE key_prefix = 'prod1a2b';
    SELECT id INTO staging_key_id FROM api_keys WHERE key_prefix = 'stag3c4d';
    SELECT id INTO datasci_key_id FROM api_keys WHERE key_prefix = 'ds5e6f';

    -- Generate varied usage data for the chart (only if keys were created)
    IF prod_key_id IS NOT NULL THEN
        INSERT INTO api_key_usage_events (api_key_id, company_id, tokens_used, created_at)
        SELECT
            prod_key_id,
            target_company_id,
            (random() * 500000 + 1000000)::int,
            s.timestamp
        FROM generate_series(NOW() - INTERVAL '7 months', NOW(), '3 days') AS s(timestamp);
    END IF;

    IF staging_key_id IS NOT NULL THEN
        INSERT INTO api_key_usage_events (api_key_id, company_id, tokens_used, created_at)
        SELECT
            staging_key_id,
            target_company_id,
            (random() * 200000 + 250000)::int,
            s.timestamp
        FROM generate_series(NOW() - INTERVAL '7 months', NOW(), '7 days') AS s(timestamp)
        WHERE random() > 0.3;
    END IF;

    IF datasci_key_id IS NOT NULL THEN
        INSERT INTO api_key_usage_events (api_key_id, company_id, tokens_used, created_at)
        SELECT
            datasci_key_id,
            target_company_id,
            (random() * 800000 + 50000)::int,
            s.timestamp
        FROM generate_series(NOW() - INTERVAL '4 months', NOW(), '5 days') AS s(timestamp)
        WHERE random() > 0.5;
    END IF;

    -- Safely unlock up to 5 random, existing, processed contributions
    RAISE NOTICE 'Safely unlocking random sample contributions...';
    WITH contributions_to_unlock AS (
        SELECT id
        FROM contributions
        WHERE
            status = 'PROCESSED'
            AND id NOT IN (
                SELECT contribution_id FROM unlocked_contributions WHERE company_id = target_company_id
            )
        ORDER BY random()
        LIMIT 5
    )
    INSERT INTO unlocked_contributions (company_id, contribution_id, unlocked_at)
    SELECT
        target_company_id,
        ctu.id,
        NOW() - (random() * 30 * INTERVAL '1 day')
    FROM contributions_to_unlock ctu;

END $$;

COMMIT;

-- This final notice will now appear correctly after the transaction commits.
SELECT 'Fake data generation complete!' AS status;