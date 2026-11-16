SELECT * FROM public.agendamentos
SELECT * FROM public.profissionais
SELECT
                    s.duracao_minutos,
                    s.preco
                FROM public.profissional_servicos ps
                INNER JOIN public.profissionais p
                    ON p.id = ps.profissional_id
                INNER JOIN public.servicos s
                    ON s.id = ps.servico_id
                WHERE ps.profissional_id = 2
                  AND ps.servico_id = 1
                  AND p.ativo = TRUE
                  AND s.ativo = TRUE
                LIMIT 1

				 SELECT hora_inicio, hora_fim
                FROM public.horarios_trabalho
                WHERE profissional_id = 2
                  AND dia_semana = 2
                ORDER BY hora_inicio

				  SELECT inicio, fim
                FROM public.agendamentos
                WHERE profissional_id = 2
                  AND status IN ('pendente', 'confirmado')
                  AND inicio < CAST(:fim_dia AS TIMESTAMPTZ)
                  AND fim > CAST(:inicio_dia AS TIMESTAMPTZ)



				  ALTER TABLE public.agendamentos
ADD COLUMN token_acesso_hash VARCHAR(64),
ADD COLUMN token_expira_em TIMESTAMPTZ;

CREATE UNIQUE INDEX idx_agendamentos_token_acesso
ON public.agendamentos (token_acesso_hash)
WHERE token_acesso_hash IS NOT NULL;