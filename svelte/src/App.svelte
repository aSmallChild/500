<script>
    import {Router, Route} from 'svelte-navigator';
    import Home from './pages/Home.svelte';
</script>

<Router>
    <Route path="/">
        <Home/>
    </Route>
</Router>

<style lang="scss" global>
  @import "css/base.scss";
</style>
