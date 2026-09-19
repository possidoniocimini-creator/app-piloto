-- ============================================================================
-- Dados de demonstração: 100 contas fictícias com progresso variado
-- Rode no SQL Editor sempre que quiser (re)gerar — ele apaga o lote anterior
-- de demonstração antes de criar um novo, então é seguro rodar mais de uma vez.
-- Só aparece no /admin (painel do mentor) — nunca no ranking real dos alunos.
-- ============================================================================

delete from auth.users where email like 'aluno-demo-%@exemplo-piloto.com';

do $$
declare
  fake_names text[] := array[
    'Ana','Bruno','Carla','Diego','Elaine','Fábio','Gabriela','Henrique','Isabela','João',
    'Karina','Lucas','Mariana','Nathan','Olívia','Pedro','Queila','Rafael','Sabrina','Thiago'
  ];
  habit_titles text[] := array[
    'Treino de força 40min','Leitura 20min','Meditação 10min','Diário noturno',
    'Estudo do negócio 30min','Caminhada 30min','Beber 2L de água','Dormir até as 23h'
  ];
  i int;
  new_user_id uuid;
  demo_email text;
  demo_name text;
  days_ago int;
  chosen_duration int;
  consistency numeric;
  duration_choices int[] := array[90, 180, 270, 365];
  num_habits int;
  h int;
  v_habit_id uuid;
  habit_weekdays smallint[];
  d date;
  wd smallint;
begin
  for i in 1..100 loop
    new_user_id := gen_random_uuid();
    demo_email := 'aluno-demo-' || i || '@exemplo-piloto.com';
    demo_name := fake_names[1 + ((i - 1) % array_length(fake_names, 1))] || ' ' || i;
    days_ago := 5 + floor(random() * 55)::int;
    chosen_duration := duration_choices[1 + floor(random() * array_length(duration_choices, 1))::int];
    consistency := 0.35 + random() * 0.6;

    insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      is_sso_user, is_super_admin
    ) values (
      new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      demo_email, crypt('nao-usado-' || i, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', demo_name),
      '', '', '', '',
      false, false
    );

    -- a trigger handle_new_user já criou a linha em profiles; agora completamos
    update public.profiles
    set is_demo = true,
        onboarding_completed = true,
        onboarding_step = 6,
        cycle_start_date = current_date - days_ago,
        goal_duration_days = chosen_duration
    where id = new_user_id;

    num_habits := 3 + floor(random() * 3)::int;

    for h in 1..num_habits loop
      habit_weekdays := coalesce(
        (select array_agg(x::smallint) from generate_series(0, 6) as x where random() < 0.7),
        array[1, 3, 5]::smallint[]
      );

      insert into public.habits (user_id, title, description, weekdays, active)
      values (
        new_user_id,
        habit_titles[1 + floor(random() * array_length(habit_titles, 1))::int],
        'Gerado automaticamente para demonstração.',
        habit_weekdays,
        true
      )
      returning id into v_habit_id;

      for d in select generate_series(current_date - days_ago, current_date - 1, interval '1 day')::date loop
        wd := extract(dow from d)::smallint;
        if wd = any(habit_weekdays) then
          insert into public.checklist_entries (user_id, habit_id, entry_date, completed, completed_at)
          values (
            new_user_id, v_habit_id, d,
            random() < consistency,
            case when random() < consistency then d::timestamptz + interval '19 hours' else null end
          )
          on conflict (habit_id, entry_date) do nothing;
        end if;
      end loop;
    end loop;
  end loop;
end $$;

-- Pra remover todos os dados de demonstração depois, rode:
-- delete from auth.users where email like 'aluno-demo-%@exemplo-piloto.com';
