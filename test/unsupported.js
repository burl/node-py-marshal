import {runTest} from './fixtures'
import PyMarshal from '..'

function notsupported(t, name, data) {
  const p = new PyMarshal(data)
  try {
    const obj = p.read()
    console.log(JSON.stringify(obj, null, 2))
    t.fail()
  } catch(e) {
    t.pass()
  }
  t.end()
}

runTest('notimp-ellipsis', 'ellipsis.pyc', notsupported);
runTest('notimp-stopiter', 'stopiter.pyc', notsupported);
runTest('notimp-bignum', 'bignum.pyc', notsupported);
runTest('notimp-complex', 'complex.pyc', notsupported);
