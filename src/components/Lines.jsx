// 문장이 마침표(.)나 쉼표(,)로 끝나거나 이어질 때 줄을 바꿔 보여준다.
// 숫자 안의 쉼표(1,000원)는 뒤에 공백이 없으므로 줄바꿈하지 않는다.
export default function Lines({ text }) {
  const parts = text.split(/(?<=[.,])\s+/);
  return parts.map((line, i) => (
    <span key={i}>
      {line}
      {i < parts.length - 1 && <br />}
    </span>
  ));
}
