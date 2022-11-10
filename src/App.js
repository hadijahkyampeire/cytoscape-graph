import { MyGraph } from './graph';
import SecondGraph from './graph2';
import './App.css';

function App() {
  return (
    <div className="App">
      <section className='info'>
        <span>Person</span>
        <img src='https://as2.ftcdn.net/v2/jpg/01/18/03/33/1000_F_118033377_JKQA3UFE4joJ1k67dNoSmmoG4EsQf9Ho.jpg' alt='person' className='person' />
        <span>Company</span>
        <img src='https://as2.ftcdn.net/v2/jpg/00/72/97/89/1000_F_72978994_Djp0dstP6T6K4hOrRzPELKClDAHKxPz1.jpg' alt='company' className='company' />
        <span>Entity</span>
        <img src='https://as1.ftcdn.net/v2/jpg/04/37/01/34/1000_F_437013476_uKlcuNHFZSk8LB1ijBmp5BCUPpCJ3iMo.jpg' alt='entity' className='entity'/>
      </section>
      {/* <MyGraph /> */}
      <SecondGraph />
    </div>
  );
}

export default App;
