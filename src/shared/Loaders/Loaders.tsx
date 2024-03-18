import loaderImg from '../../assets/img/loader.svg';

const Loader = () => {
  return (
    <div style={{backgroundColor: '#222831'}}>
      <img src={loaderImg} className="loader-img" alt="Loader" />
    </div>
  );
};

export default Loader;
