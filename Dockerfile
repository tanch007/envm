FROM electronuserland/builder:wine AS builder

WORKDIR /workspace
COPY . .
RUN cd app && npm i && npm run build:winui

# ---------- 新增导出阶段 ----------
FROM scratch AS export
COPY --from=builder /workspace/app/dist/release /release