function DataIteration(props) {
  const { datas = [], startLength, endLength, children } = props;
  const safeDatas = Array.isArray(datas) ? datas : [];

  return (
    <>
      {safeDatas.length >= endLength
        ? safeDatas.slice(startLength, endLength).map((value, index) => (
          <React.Fragment key={index}>{children({ datas: value })}</React.Fragment>
        ))
        : safeDatas.slice(startLength, safeDatas.length).map((value, index) => (
          <React.Fragment key={index}>{children({ datas: value })}</React.Fragment>
        ))}
    </>
  );
}

export default DataIteration;
