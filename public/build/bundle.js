
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    function getAllContexts() {
        return get_current_component().$$.context;
    }
    function hasContext(key) {
        return get_current_component().$$.context.has(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.42.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }
    /**
     * Base class to create strongly typed Svelte components.
     * This only exists for typing purposes and should be used in `.d.ts` files.
     *
     * ### Example:
     *
     * You have component library on npm called `component-library`, from which
     * you export a component called `MyComponent`. For Svelte+TypeScript users,
     * you want to provide typings. Therefore you create a `index.d.ts`:
     * ```ts
     * import { SvelteComponentTyped } from "svelte";
     * export class MyComponent extends SvelteComponentTyped<{foo: string}> {}
     * ```
     * Typing this makes it possible for IDEs like VS Code with the Svelte extension
     * to provide intellisense and to use the component like this in a Svelte file
     * with TypeScript:
     * ```svelte
     * <script lang="ts">
     * 	import { MyComponent } from "component-library";
     * </script>
     * <MyComponent foo={'bar'} />
     * ```
     *
     * #### Why not make this part of `SvelteComponent(Dev)`?
     * Because
     * ```ts
     * class ASubclassOfSvelteComponent extends SvelteComponent<{foo: string}> {}
     * const component: typeof SvelteComponent = ASubclassOfSvelteComponent;
     * ```
     * will throw a type error, so we need to separate the more strictly typed class.
     */
    class SvelteComponentTyped extends SvelteComponentDev {
        constructor(options) {
            super(options);
        }
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    var _ = {
      $(selector) {
        if (typeof selector === "string") {
          return document.querySelector(selector);
        }
        return selector;
      },
      extend(...args) {
        return Object.assign(...args);
      },
      cumulativeOffset(element) {
        let top = 0;
        let left = 0;

        do {
          top += element.offsetTop || 0;
          left += element.offsetLeft || 0;
          element = element.offsetParent;
        } while (element);

        return {
          top: top,
          left: left
        };
      },
      directScroll(element) {
        return element && element !== document && element !== document.body;
      },
      scrollTop(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollTop = value) : element.scrollTop;
        } else {
          return inSetter
            ? (document.documentElement.scrollTop = document.body.scrollTop = value)
            : window.pageYOffset ||
                document.documentElement.scrollTop ||
                document.body.scrollTop ||
                0;
        }
      },
      scrollLeft(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollLeft = value) : element.scrollLeft;
        } else {
          return inSetter
            ? (document.documentElement.scrollLeft = document.body.scrollLeft = value)
            : window.pageXOffset ||
                document.documentElement.scrollLeft ||
                document.body.scrollLeft ||
                0;
        }
      }
    };

    const defaultOptions = {
      container: "body",
      duration: 500,
      delay: 0,
      offset: 0,
      easing: cubicInOut,
      onStart: noop,
      onDone: noop,
      onAborting: noop,
      scrollX: false,
      scrollY: true
    };

    const _scrollTo = options => {
      let {
        offset,
        duration,
        delay,
        easing,
        x=0,
        y=0,
        scrollX,
        scrollY,
        onStart,
        onDone,
        container,
        onAborting,
        element
      } = options;

      if (typeof offset === "function") {
        offset = offset();
      }

      var cumulativeOffsetContainer = _.cumulativeOffset(container);
      var cumulativeOffsetTarget = element
        ? _.cumulativeOffset(element)
        : { top: y, left: x };

      var initialX = _.scrollLeft(container);
      var initialY = _.scrollTop(container);

      var targetX =
        cumulativeOffsetTarget.left - cumulativeOffsetContainer.left + offset;
      var targetY =
        cumulativeOffsetTarget.top - cumulativeOffsetContainer.top + offset;

      var diffX = targetX - initialX;
    	var diffY = targetY - initialY;

      let scrolling = true;
      let started = false;
      let start_time = now() + delay;
      let end_time = start_time + duration;

      function scrollToTopLeft(element, top, left) {
        if (scrollX) _.scrollLeft(element, left);
        if (scrollY) _.scrollTop(element, top);
      }

      function start(delayStart) {
        if (!delayStart) {
          started = true;
          onStart(element, {x, y});
        }
      }

      function tick(progress) {
        scrollToTopLeft(
          container,
          initialY + diffY * progress,
          initialX + diffX * progress
        );
      }

      function stop() {
        scrolling = false;
      }

      loop(now => {
        if (!started && now >= start_time) {
          start(false);
        }

        if (started && now >= end_time) {
          tick(1);
          stop();
          onDone(element, {x, y});
        }

        if (!scrolling) {
          onAborting(element, {x, y});
          return false;
        }
        if (started) {
          const p = now - start_time;
          const t = 0 + 1 * easing(p / duration);
          tick(t);
        }

        return true;
      });

      start(delay);

      tick(0);

      return stop;
    };

    const proceedOptions = options => {
    	let opts = _.extend({}, defaultOptions, options);
      opts.container = _.$(opts.container);
      opts.element = _.$(opts.element);
      return opts;
    };

    const scrollContainerHeight = containerElement => {
      if (
        containerElement &&
        containerElement !== document &&
        containerElement !== document.body
      ) {
        return containerElement.scrollHeight - containerElement.offsetHeight;
      } else {
        let body = document.body;
        let html = document.documentElement;

        return Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
      }
    };

    const setGlobalOptions = options => {
    	_.extend(defaultOptions, options || {});
    };

    const scrollTo = options => {
      return _scrollTo(proceedOptions(options));
    };

    const scrollToBottom = options => {
      options = proceedOptions(options);

      return _scrollTo(
        _.extend(options, {
          element: null,
          y: scrollContainerHeight(options.container)
        })
      );
    };

    const scrollToTop = options => {
      options = proceedOptions(options);

      return _scrollTo(
        _.extend(options, {
          element: null,
          y: 0
        })
      );
    };

    const makeScrollToAction = scrollToFunc => {
      return (node, options) => {
        let current = options;
        const handle = e => {
          e.preventDefault();
          scrollToFunc(
            typeof current === "string" ? { element: current } : current
          );
        };
        node.addEventListener("click", handle);
        node.addEventListener("touchstart", handle);
        return {
          update(options) {
            current = options;
          },
          destroy() {
            node.removeEventListener("click", handle);
            node.removeEventListener("touchstart", handle);
          }
        };
      };
    };

    const scrollto = makeScrollToAction(scrollTo);
    const scrolltotop = makeScrollToAction(scrollToTop);
    const scrolltobottom = makeScrollToAction(scrollToBottom);

    var animateScroll = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setGlobalOptions: setGlobalOptions,
        scrollTo: scrollTo,
        scrollToBottom: scrollToBottom,
        scrollToTop: scrollToTop,
        makeScrollToAction: makeScrollToAction,
        scrollto: scrollto,
        scrolltotop: scrolltotop,
        scrolltobottom: scrolltobottom
    });

    /* src\UI\Button.svelte generated by Svelte v3.42.4 */

    const file$f = "src\\UI\\Button.svelte";

    // (53:3) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(/*mode*/ ctx[3]) + " svelte-1xqsnrb"));
    			attr_dev(button, "type", /*type*/ ctx[0]);
    			add_location(button, file$f, 53, 5, 1045);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			button.innerHTML = /*caption*/ ctx[1];

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*caption*/ 2) button.innerHTML = /*caption*/ ctx[1];
    			if (dirty & /*mode*/ 8 && button_class_value !== (button_class_value = "" + (null_to_empty(/*mode*/ ctx[3]) + " svelte-1xqsnrb"))) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty & /*type*/ 1) {
    				attr_dev(button, "type", /*type*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(53:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:1) {#if href}
    function create_if_block$2(ctx) {
    	let a;
    	let a_class_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			attr_dev(a, "href", /*href*/ ctx[2]);
    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(/*mode*/ ctx[3]) + " svelte-1xqsnrb"));
    			add_location(a, file$f, 51, 5, 982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			a.innerHTML = /*caption*/ ctx[1];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*caption*/ 2) a.innerHTML = /*caption*/ ctx[1];
    			if (dirty & /*href*/ 4) {
    				attr_dev(a, "href", /*href*/ ctx[2]);
    			}

    			if (dirty & /*mode*/ 8 && a_class_value !== (a_class_value = "" + (null_to_empty(/*mode*/ ctx[3]) + " svelte-1xqsnrb"))) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(51:1) {#if href}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[2]) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Button', slots, []);
    	let { type = "" } = $$props;
    	let { caption = "" } = $$props;
    	let { href = null } = $$props;
    	let { mode = "" } = $$props;
    	const writable_props = ['type', 'caption', 'href', 'mode'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('caption' in $$props) $$invalidate(1, caption = $$props.caption);
    		if ('href' in $$props) $$invalidate(2, href = $$props.href);
    		if ('mode' in $$props) $$invalidate(3, mode = $$props.mode);
    	};

    	$$self.$capture_state = () => ({ type, caption, href, mode });

    	$$self.$inject_state = $$props => {
    		if ('type' in $$props) $$invalidate(0, type = $$props.type);
    		if ('caption' in $$props) $$invalidate(1, caption = $$props.caption);
    		if ('href' in $$props) $$invalidate(2, href = $$props.href);
    		if ('mode' in $$props) $$invalidate(3, mode = $$props.mode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [type, caption, href, mode, click_handler];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { type: 0, caption: 1, href: 2, mode: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get type() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get caption() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set caption(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mode() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mode(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Block\Header.svelte generated by Svelte v3.42.4 */
    const file$e = "src\\Block\\Header.svelte";

    function create_fragment$e(ctx) {
    	let header;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let t2;
    	let div2;
    	let button0;
    	let t3;
    	let div3;
    	let button1;
    	let t4;
    	let div4;
    	let button2;
    	let current;

    	button0 = new Button({
    			props: {
    				href: "mailto:" + /*email*/ ctx[0],
    				caption: "✉️ " + /*email*/ ctx[0]
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				href: "tel:" + /*phone*/ ctx[1],
    				mode: "outline",
    				caption: "" + (/*phone*/ ctx[1] + " ☎️ Отдел логистики")
    			},
    			$$inline: true
    		});

    	button2 = new Button({
    			props: {
    				href: "tel:" + /*phone*/ ctx[1],
    				mode: "outline",
    				caption: "☎️ " + /*phone*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "Логистика и консалтинг под ключ";
    			t2 = space();
    			div2 = element("div");
    			create_component(button0.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			create_component(button1.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			create_component(button2.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = "assets/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "logo svelte-d7lryr");
    			add_location(img, file$e, 62, 8, 1311);
    			attr_dev(div0, "class", "svelte-d7lryr");
    			add_location(div0, file$e, 61, 4, 1296);
    			attr_dev(div1, "class", "svelte-d7lryr");
    			add_location(div1, file$e, 64, 4, 1380);
    			attr_dev(div2, "class", "svelte-d7lryr");
    			add_location(div2, file$e, 67, 4, 1444);
    			attr_dev(div3, "class", "svelte-d7lryr");
    			add_location(div3, file$e, 70, 4, 1530);
    			attr_dev(div4, "class", "svelte-d7lryr");
    			add_location(div4, file$e, 74, 4, 1645);
    			attr_dev(header, "class", "svelte-d7lryr");
    			add_location(header, file$e, 60, 0, 1282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(div0, img);
    			append_dev(header, t0);
    			append_dev(header, div1);
    			append_dev(header, t2);
    			append_dev(header, div2);
    			mount_component(button0, div2, null);
    			append_dev(header, t3);
    			append_dev(header, div3);
    			mount_component(button1, div3, null);
    			append_dev(header, t4);
    			append_dev(header, div4);
    			mount_component(button2, div4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};
    			if (dirty & /*email*/ 1) button0_changes.href = "mailto:" + /*email*/ ctx[0];
    			if (dirty & /*email*/ 1) button0_changes.caption = "✉️ " + /*email*/ ctx[0];
    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*phone*/ 2) button1_changes.href = "tel:" + /*phone*/ ctx[1];
    			if (dirty & /*phone*/ 2) button1_changes.caption = "" + (/*phone*/ ctx[1] + " ☎️ Отдел логистики");
    			button1.$set(button1_changes);
    			const button2_changes = {};
    			if (dirty & /*phone*/ 2) button2_changes.href = "tel:" + /*phone*/ ctx[1];
    			if (dirty & /*phone*/ 2) button2_changes.caption = "☎️ " + /*phone*/ ctx[1];
    			button2.$set(button2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_component(button0);
    			destroy_component(button1);
    			destroy_component(button2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { email } = $$props;
    	let { phone } = $$props;
    	const writable_props = ['email', 'phone'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('phone' in $$props) $$invalidate(1, phone = $$props.phone);
    	};

    	$$self.$capture_state = () => ({ Button, email, phone });

    	$$self.$inject_state = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('phone' in $$props) $$invalidate(1, phone = $$props.phone);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [email, phone];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { email: 0, phone: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*email*/ ctx[0] === undefined && !('email' in props)) {
    			console.warn("<Header> was created without expected prop 'email'");
    		}

    		if (/*phone*/ ctx[1] === undefined && !('phone' in props)) {
    			console.warn("<Header> was created without expected prop 'phone'");
    		}
    	}

    	get email() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get phone() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set phone(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }

      return _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      });
      if (superClass) _setPrototypeOf(subClass, superClass);
    }

    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
      };

      return _setPrototypeOf(o, p);
    }

    function _isNativeReflectConstruct() {
      if (typeof Reflect === "undefined" || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if (typeof Proxy === "function") return true;

      try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
        return true;
      } catch (e) {
        return false;
      }
    }

    function _objectWithoutPropertiesLoose(source, excluded) {
      if (source == null) return {};
      var target = {};
      var sourceKeys = Object.keys(source);
      var key, i;

      for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
      }

      return target;
    }

    function _objectWithoutProperties(source, excluded) {
      if (source == null) return {};

      var target = _objectWithoutPropertiesLoose(source, excluded);

      var key, i;

      if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

        for (i = 0; i < sourceSymbolKeys.length; i++) {
          key = sourceSymbolKeys[i];
          if (excluded.indexOf(key) >= 0) continue;
          if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
          target[key] = source[key];
        }
      }

      return target;
    }

    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return self;
    }

    function _possibleConstructorReturn(self, call) {
      if (call && (typeof call === "object" || typeof call === "function")) {
        return call;
      } else if (call !== void 0) {
        throw new TypeError("Derived constructors may only return object or undefined");
      }

      return _assertThisInitialized(self);
    }

    function _createSuper(Derived) {
      var hasNativeReflectConstruct = _isNativeReflectConstruct();

      return function _createSuperInternal() {
        var Super = _getPrototypeOf(Derived),
            result;

        if (hasNativeReflectConstruct) {
          var NewTarget = _getPrototypeOf(this).constructor;

          result = Reflect.construct(Super, arguments, NewTarget);
        } else {
          result = Super.apply(this, arguments);
        }

        return _possibleConstructorReturn(this, result);
      };
    }

    function _superPropBase(object, property) {
      while (!Object.prototype.hasOwnProperty.call(object, property)) {
        object = _getPrototypeOf(object);
        if (object === null) break;
      }

      return object;
    }

    function _get(target, property, receiver) {
      if (typeof Reflect !== "undefined" && Reflect.get) {
        _get = Reflect.get;
      } else {
        _get = function _get(target, property, receiver) {
          var base = _superPropBase(target, property);

          if (!base) return;
          var desc = Object.getOwnPropertyDescriptor(base, property);

          if (desc.get) {
            return desc.get.call(receiver);
          }

          return desc.value;
        };
      }

      return _get(target, property, receiver || target);
    }

    function set(target, property, value, receiver) {
      if (typeof Reflect !== "undefined" && Reflect.set) {
        set = Reflect.set;
      } else {
        set = function set(target, property, value, receiver) {
          var base = _superPropBase(target, property);

          var desc;

          if (base) {
            desc = Object.getOwnPropertyDescriptor(base, property);

            if (desc.set) {
              desc.set.call(receiver, value);
              return true;
            } else if (!desc.writable) {
              return false;
            }
          }

          desc = Object.getOwnPropertyDescriptor(receiver, property);

          if (desc) {
            if (!desc.writable) {
              return false;
            }

            desc.value = value;
            Object.defineProperty(receiver, property, desc);
          } else {
            _defineProperty(receiver, property, value);
          }

          return true;
        };
      }

      return set(target, property, value, receiver);
    }

    function _set(target, property, value, receiver, isStrict) {
      var s = set(target, property, value, receiver || target);

      if (!s && isStrict) {
        throw new Error('failed to set property');
      }

      return value;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    /** Checks if value is string */
    function isString(str) {
      return typeof str === 'string' || str instanceof String;
    }
    /**
      Direction
      @prop {string} NONE
      @prop {string} LEFT
      @prop {string} FORCE_LEFT
      @prop {string} RIGHT
      @prop {string} FORCE_RIGHT
    */

    var DIRECTION = {
      NONE: 'NONE',
      LEFT: 'LEFT',
      FORCE_LEFT: 'FORCE_LEFT',
      RIGHT: 'RIGHT',
      FORCE_RIGHT: 'FORCE_RIGHT'
    };
    /** */

    function forceDirection(direction) {
      switch (direction) {
        case DIRECTION.LEFT:
          return DIRECTION.FORCE_LEFT;

        case DIRECTION.RIGHT:
          return DIRECTION.FORCE_RIGHT;

        default:
          return direction;
      }
    }
    /** Escapes regular expression control chars */

    function escapeRegExp(str) {
      return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
    } // cloned from https://github.com/epoberezkin/fast-deep-equal with small changes

    function objectIncludes(b, a) {
      if (a === b) return true;
      var arrA = Array.isArray(a),
          arrB = Array.isArray(b),
          i;

      if (arrA && arrB) {
        if (a.length != b.length) return false;

        for (i = 0; i < a.length; i++) {
          if (!objectIncludes(a[i], b[i])) return false;
        }

        return true;
      }

      if (arrA != arrB) return false;

      if (a && b && _typeof(a) === 'object' && _typeof(b) === 'object') {
        var dateA = a instanceof Date,
            dateB = b instanceof Date;
        if (dateA && dateB) return a.getTime() == b.getTime();
        if (dateA != dateB) return false;
        var regexpA = a instanceof RegExp,
            regexpB = b instanceof RegExp;
        if (regexpA && regexpB) return a.toString() == b.toString();
        if (regexpA != regexpB) return false;
        var keys = Object.keys(a); // if (keys.length !== Object.keys(b).length) return false;

        for (i = 0; i < keys.length; i++) {
          if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        }

        for (i = 0; i < keys.length; i++) {
          if (!objectIncludes(b[keys[i]], a[keys[i]])) return false;
        }

        return true;
      } else if (a && b && typeof a === 'function' && typeof b === 'function') {
        return a.toString() === b.toString();
      }

      return false;
    }

    /** Provides details of changing input */

    var ActionDetails = /*#__PURE__*/function () {
      /** Current input value */

      /** Current cursor position */

      /** Old input value */

      /** Old selection */
      function ActionDetails(value, cursorPos, oldValue, oldSelection) {
        _classCallCheck(this, ActionDetails);

        this.value = value;
        this.cursorPos = cursorPos;
        this.oldValue = oldValue;
        this.oldSelection = oldSelection; // double check if left part was changed (autofilling, other non-standard input triggers)

        while (this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos)) {
          --this.oldSelection.start;
        }
      }
      /**
        Start changing position
        @readonly
      */


      _createClass(ActionDetails, [{
        key: "startChangePos",
        get: function get() {
          return Math.min(this.cursorPos, this.oldSelection.start);
        }
        /**
          Inserted symbols count
          @readonly
        */

      }, {
        key: "insertedCount",
        get: function get() {
          return this.cursorPos - this.startChangePos;
        }
        /**
          Inserted symbols
          @readonly
        */

      }, {
        key: "inserted",
        get: function get() {
          return this.value.substr(this.startChangePos, this.insertedCount);
        }
        /**
          Removed symbols count
          @readonly
        */

      }, {
        key: "removedCount",
        get: function get() {
          // Math.max for opposite operation
          return Math.max(this.oldSelection.end - this.startChangePos || // for Delete
          this.oldValue.length - this.value.length, 0);
        }
        /**
          Removed symbols
          @readonly
        */

      }, {
        key: "removed",
        get: function get() {
          return this.oldValue.substr(this.startChangePos, this.removedCount);
        }
        /**
          Unchanged head symbols
          @readonly
        */

      }, {
        key: "head",
        get: function get() {
          return this.value.substring(0, this.startChangePos);
        }
        /**
          Unchanged tail symbols
          @readonly
        */

      }, {
        key: "tail",
        get: function get() {
          return this.value.substring(this.startChangePos + this.insertedCount);
        }
        /**
          Remove direction
          @readonly
        */

      }, {
        key: "removeDirection",
        get: function get() {
          if (!this.removedCount || this.insertedCount) return DIRECTION.NONE; // align right if delete at right or if range removed (event with backspace)

          return this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos ? DIRECTION.RIGHT : DIRECTION.LEFT;
        }
      }]);

      return ActionDetails;
    }();

    /**
      Provides details of changing model value
      @param {Object} [details]
      @param {string} [details.inserted] - Inserted symbols
      @param {boolean} [details.skip] - Can skip chars
      @param {number} [details.removeCount] - Removed symbols count
      @param {number} [details.tailShift] - Additional offset if any changes occurred before tail
    */
    var ChangeDetails = /*#__PURE__*/function () {
      /** Inserted symbols */

      /** Can skip chars */

      /** Additional offset if any changes occurred before tail */

      /** Raw inserted is used by dynamic mask */
      function ChangeDetails(details) {
        _classCallCheck(this, ChangeDetails);

        Object.assign(this, {
          inserted: '',
          rawInserted: '',
          skip: false,
          tailShift: 0
        }, details);
      }
      /**
        Aggregate changes
        @returns {ChangeDetails} `this`
      */


      _createClass(ChangeDetails, [{
        key: "aggregate",
        value: function aggregate(details) {
          this.rawInserted += details.rawInserted;
          this.skip = this.skip || details.skip;
          this.inserted += details.inserted;
          this.tailShift += details.tailShift;
          return this;
        }
        /** Total offset considering all changes */

      }, {
        key: "offset",
        get: function get() {
          return this.tailShift + this.inserted.length;
        }
      }]);

      return ChangeDetails;
    }();

    /** Provides details of continuous extracted tail */
    var ContinuousTailDetails = /*#__PURE__*/function () {
      /** Tail value as string */

      /** Tail start position */

      /** Start position */
      function ContinuousTailDetails() {
        var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var stop = arguments.length > 2 ? arguments[2] : undefined;

        _classCallCheck(this, ContinuousTailDetails);

        this.value = value;
        this.from = from;
        this.stop = stop;
      }

      _createClass(ContinuousTailDetails, [{
        key: "toString",
        value: function toString() {
          return this.value;
        }
      }, {
        key: "extend",
        value: function extend(tail) {
          this.value += String(tail);
        }
      }, {
        key: "appendTo",
        value: function appendTo(masked) {
          return masked.append(this.toString(), {
            tail: true
          }).aggregate(masked._appendPlaceholder());
        }
      }, {
        key: "state",
        get: function get() {
          return {
            value: this.value,
            from: this.from,
            stop: this.stop
          };
        },
        set: function set(state) {
          Object.assign(this, state);
        }
      }, {
        key: "shiftBefore",
        value: function shiftBefore(pos) {
          if (this.from >= pos || !this.value.length) return '';
          var shiftChar = this.value[0];
          this.value = this.value.slice(1);
          return shiftChar;
        }
      }]);

      return ContinuousTailDetails;
    }();

    /**
     * Applies mask on element.
     * @constructor
     * @param {HTMLInputElement|HTMLTextAreaElement|MaskElement} el - Element to apply mask
     * @param {Object} opts - Custom mask options
     * @return {InputMask}
     */
    function IMask(el) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      // currently available only for input-like elements
      return new IMask.InputMask(el, opts);
    }

    /** Supported mask type */

    /** Provides common masking stuff */
    var Masked = /*#__PURE__*/function () {
      // $Shape<MaskedOptions>; TODO after fix https://github.com/facebook/flow/issues/4773

      /** @type {Mask} */

      /** */
      // $FlowFixMe no ideas

      /** Transforms value before mask processing */

      /** Validates if value is acceptable */

      /** Does additional processing in the end of editing */

      /** Format typed value to string */

      /** Parse strgin to get typed value */

      /** Enable characters overwriting */

      /** */
      function Masked(opts) {
        _classCallCheck(this, Masked);

        this._value = '';

        this._update(Object.assign({}, Masked.DEFAULTS, opts));

        this.isInitialized = true;
      }
      /** Sets and applies new options */


      _createClass(Masked, [{
        key: "updateOptions",
        value: function updateOptions(opts) {
          if (!Object.keys(opts).length) return;
          this.withValueRefresh(this._update.bind(this, opts));
        }
        /**
          Sets new options
          @protected
        */

      }, {
        key: "_update",
        value: function _update(opts) {
          Object.assign(this, opts);
        }
        /** Mask state */

      }, {
        key: "state",
        get: function get() {
          return {
            _value: this.value
          };
        },
        set: function set(state) {
          this._value = state._value;
        }
        /** Resets value */

      }, {
        key: "reset",
        value: function reset() {
          this._value = '';
        }
        /** */

      }, {
        key: "value",
        get: function get() {
          return this._value;
        },
        set: function set(value) {
          this.resolve(value);
        }
        /** Resolve new value */

      }, {
        key: "resolve",
        value: function resolve(value) {
          this.reset();
          this.append(value, {
            input: true
          }, '');
          this.doCommit();
          return this.value;
        }
        /** */

      }, {
        key: "unmaskedValue",
        get: function get() {
          return this.value;
        },
        set: function set(value) {
          this.reset();
          this.append(value, {}, '');
          this.doCommit();
        }
        /** */

      }, {
        key: "typedValue",
        get: function get() {
          return this.doParse(this.value);
        },
        set: function set(value) {
          this.value = this.doFormat(value);
        }
        /** Value that includes raw user input */

      }, {
        key: "rawInputValue",
        get: function get() {
          return this.extractInput(0, this.value.length, {
            raw: true
          });
        },
        set: function set(value) {
          this.reset();
          this.append(value, {
            raw: true
          }, '');
          this.doCommit();
        }
        /** */

      }, {
        key: "isComplete",
        get: function get() {
          return true;
        }
        /** Finds nearest input position in direction */

      }, {
        key: "nearestInputPos",
        value: function nearestInputPos(cursorPos, direction) {
          return cursorPos;
        }
        /** Extracts value in range considering flags */

      }, {
        key: "extractInput",
        value: function extractInput() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
          return this.value.slice(fromPos, toPos);
        }
        /** Extracts tail in range */

      }, {
        key: "extractTail",
        value: function extractTail() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
          return new ContinuousTailDetails(this.extractInput(fromPos, toPos), fromPos);
        }
        /** Appends tail */
        // $FlowFixMe no ideas

      }, {
        key: "appendTail",
        value: function appendTail(tail) {
          if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
          return tail.appendTo(this);
        }
        /** Appends char */

      }, {
        key: "_appendCharRaw",
        value: function _appendCharRaw(ch) {
          if (!ch) return new ChangeDetails();
          this._value += ch;
          return new ChangeDetails({
            inserted: ch,
            rawInserted: ch
          });
        }
        /** Appends char */

      }, {
        key: "_appendChar",
        value: function _appendChar(ch) {
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var checkTail = arguments.length > 2 ? arguments[2] : undefined;
          var consistentState = this.state;

          var details = this._appendCharRaw(this.doPrepare(ch, flags), flags);

          if (details.inserted) {
            var consistentTail;
            var appended = this.doValidate(flags) !== false;

            if (appended && checkTail != null) {
              // validation ok, check tail
              var beforeTailState = this.state;

              if (this.overwrite) {
                consistentTail = checkTail.state;
                checkTail.shiftBefore(this.value.length);
              }

              var tailDetails = this.appendTail(checkTail);
              appended = tailDetails.rawInserted === checkTail.toString(); // if ok, rollback state after tail

              if (appended && tailDetails.inserted) this.state = beforeTailState;
            } // revert all if something went wrong


            if (!appended) {
              details = new ChangeDetails();
              this.state = consistentState;
              if (checkTail && consistentTail) checkTail.state = consistentTail;
            }
          }

          return details;
        }
        /** Appends optional placeholder at end */

      }, {
        key: "_appendPlaceholder",
        value: function _appendPlaceholder() {
          return new ChangeDetails();
        }
        /** Appends symbols considering flags */
        // $FlowFixMe no ideas

      }, {
        key: "append",
        value: function append(str, flags, tail) {
          if (!isString(str)) throw new Error('value should be string');
          var details = new ChangeDetails();
          var checkTail = isString(tail) ? new ContinuousTailDetails(String(tail)) : tail;
          if (flags && flags.tail) flags._beforeTailState = this.state;

          for (var ci = 0; ci < str.length; ++ci) {
            details.aggregate(this._appendChar(str[ci], flags, checkTail));
          } // append tail but aggregate only tailShift


          if (checkTail != null) {
            details.tailShift += this.appendTail(checkTail).tailShift; // TODO it's a good idea to clear state after appending ends
            // but it causes bugs when one append calls another (when dynamic dispatch set rawInputValue)
            // this._resetBeforeTailState();
          }

          return details;
        }
        /** */

      }, {
        key: "remove",
        value: function remove() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
          this._value = this.value.slice(0, fromPos) + this.value.slice(toPos);
          return new ChangeDetails();
        }
        /** Calls function and reapplies current value */

      }, {
        key: "withValueRefresh",
        value: function withValueRefresh(fn) {
          if (this._refreshing || !this.isInitialized) return fn();
          this._refreshing = true;
          var rawInput = this.rawInputValue;
          var value = this.value;
          var ret = fn();
          this.rawInputValue = rawInput; // append lost trailing chars at end

          if (this.value && this.value !== value && value.indexOf(this.value) === 0) {
            this.append(value.slice(this.value.length), {}, '');
          }

          delete this._refreshing;
          return ret;
        }
        /** */

      }, {
        key: "runIsolated",
        value: function runIsolated(fn) {
          if (this._isolated || !this.isInitialized) return fn(this);
          this._isolated = true;
          var state = this.state;
          var ret = fn(this);
          this.state = state;
          delete this._isolated;
          return ret;
        }
        /**
          Prepares string before mask processing
          @protected
        */

      }, {
        key: "doPrepare",
        value: function doPrepare(str) {
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return this.prepare ? this.prepare(str, this, flags) : str;
        }
        /**
          Validates if value is acceptable
          @protected
        */

      }, {
        key: "doValidate",
        value: function doValidate(flags) {
          return (!this.validate || this.validate(this.value, this, flags)) && (!this.parent || this.parent.doValidate(flags));
        }
        /**
          Does additional processing in the end of editing
          @protected
        */

      }, {
        key: "doCommit",
        value: function doCommit() {
          if (this.commit) this.commit(this.value, this);
        }
        /** */

      }, {
        key: "doFormat",
        value: function doFormat(value) {
          return this.format ? this.format(value, this) : value;
        }
        /** */

      }, {
        key: "doParse",
        value: function doParse(str) {
          return this.parse ? this.parse(str, this) : str;
        }
        /** */

      }, {
        key: "splice",
        value: function splice(start, deleteCount, inserted, removeDirection) {
          var tailPos = start + deleteCount;
          var tail = this.extractTail(tailPos);
          var startChangePos = this.nearestInputPos(start, removeDirection);
          var changeDetails = new ChangeDetails({
            tailShift: startChangePos - start // adjust tailShift if start was aligned

          }).aggregate(this.remove(startChangePos)).aggregate(this.append(inserted, {
            input: true
          }, tail));
          return changeDetails;
        }
      }]);

      return Masked;
    }();
    Masked.DEFAULTS = {
      format: function format(v) {
        return v;
      },
      parse: function parse(v) {
        return v;
      }
    };
    IMask.Masked = Masked;

    /** Get Masked class by mask type */

    function maskedClass(mask) {
      if (mask == null) {
        throw new Error('mask property should be defined');
      } // $FlowFixMe


      if (mask instanceof RegExp) return IMask.MaskedRegExp; // $FlowFixMe

      if (isString(mask)) return IMask.MaskedPattern; // $FlowFixMe

      if (mask instanceof Date || mask === Date) return IMask.MaskedDate; // $FlowFixMe

      if (mask instanceof Number || typeof mask === 'number' || mask === Number) return IMask.MaskedNumber; // $FlowFixMe

      if (Array.isArray(mask) || mask === Array) return IMask.MaskedDynamic; // $FlowFixMe

      if (IMask.Masked && mask.prototype instanceof IMask.Masked) return mask; // $FlowFixMe

      if (mask instanceof Function) return IMask.MaskedFunction; // $FlowFixMe

      if (mask instanceof IMask.Masked) return mask.constructor;
      console.warn('Mask not found for mask', mask); // eslint-disable-line no-console
      // $FlowFixMe

      return IMask.Masked;
    }
    /** Creates new {@link Masked} depending on mask type */

    function createMask(opts) {
      // $FlowFixMe
      if (IMask.Masked && opts instanceof IMask.Masked) return opts;
      opts = Object.assign({}, opts);
      var mask = opts.mask; // $FlowFixMe

      if (IMask.Masked && mask instanceof IMask.Masked) return mask;
      var MaskedClass = maskedClass(mask);
      if (!MaskedClass) throw new Error('Masked class is not found for provided mask, appropriate module needs to be import manually before creating mask.');
      return new MaskedClass(opts);
    }
    IMask.createMask = createMask;

    var _excluded$4 = ["mask"];
    var DEFAULT_INPUT_DEFINITIONS = {
      '0': /\d/,
      'a': /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
      // http://stackoverflow.com/a/22075070
      '*': /./
    };
    /** */

    var PatternInputDefinition = /*#__PURE__*/function () {
      /** */

      /** */

      /** */

      /** */

      /** */

      /** */
      function PatternInputDefinition(opts) {
        _classCallCheck(this, PatternInputDefinition);

        var mask = opts.mask,
            blockOpts = _objectWithoutProperties(opts, _excluded$4);

        this.masked = createMask({
          mask: mask
        });
        Object.assign(this, blockOpts);
      }

      _createClass(PatternInputDefinition, [{
        key: "reset",
        value: function reset() {
          this._isFilled = false;
          this.masked.reset();
        }
      }, {
        key: "remove",
        value: function remove() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;

          if (fromPos === 0 && toPos >= 1) {
            this._isFilled = false;
            return this.masked.remove(fromPos, toPos);
          }

          return new ChangeDetails();
        }
      }, {
        key: "value",
        get: function get() {
          return this.masked.value || (this._isFilled && !this.isOptional ? this.placeholderChar : '');
        }
      }, {
        key: "unmaskedValue",
        get: function get() {
          return this.masked.unmaskedValue;
        }
      }, {
        key: "isComplete",
        get: function get() {
          return Boolean(this.masked.value) || this.isOptional;
        }
      }, {
        key: "_appendChar",
        value: function _appendChar(str) {
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          if (this._isFilled) return new ChangeDetails();
          var state = this.masked.state; // simulate input

          var details = this.masked._appendChar(str, flags);

          if (details.inserted && this.doValidate(flags) === false) {
            details.inserted = details.rawInserted = '';
            this.masked.state = state;
          }

          if (!details.inserted && !this.isOptional && !this.lazy && !flags.input) {
            details.inserted = this.placeholderChar;
          }

          details.skip = !details.inserted && !this.isOptional;
          this._isFilled = Boolean(details.inserted);
          return details;
        }
      }, {
        key: "append",
        value: function append() {
          var _this$masked;

          return (_this$masked = this.masked).append.apply(_this$masked, arguments);
        }
      }, {
        key: "_appendPlaceholder",
        value: function _appendPlaceholder() {
          var details = new ChangeDetails();
          if (this._isFilled || this.isOptional) return details;
          this._isFilled = true;
          details.inserted = this.placeholderChar;
          return details;
        }
      }, {
        key: "extractTail",
        value: function extractTail() {
          var _this$masked2;

          return (_this$masked2 = this.masked).extractTail.apply(_this$masked2, arguments);
        }
      }, {
        key: "appendTail",
        value: function appendTail() {
          var _this$masked3;

          return (_this$masked3 = this.masked).appendTail.apply(_this$masked3, arguments);
        }
      }, {
        key: "extractInput",
        value: function extractInput() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
          var flags = arguments.length > 2 ? arguments[2] : undefined;
          return this.masked.extractInput(fromPos, toPos, flags);
        }
      }, {
        key: "nearestInputPos",
        value: function nearestInputPos(cursorPos) {
          var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DIRECTION.NONE;
          var minPos = 0;
          var maxPos = this.value.length;
          var boundPos = Math.min(Math.max(cursorPos, minPos), maxPos);

          switch (direction) {
            case DIRECTION.LEFT:
            case DIRECTION.FORCE_LEFT:
              return this.isComplete ? boundPos : minPos;

            case DIRECTION.RIGHT:
            case DIRECTION.FORCE_RIGHT:
              return this.isComplete ? boundPos : maxPos;

            case DIRECTION.NONE:
            default:
              return boundPos;
          }
        }
      }, {
        key: "doValidate",
        value: function doValidate() {
          var _this$masked4, _this$parent;

          return (_this$masked4 = this.masked).doValidate.apply(_this$masked4, arguments) && (!this.parent || (_this$parent = this.parent).doValidate.apply(_this$parent, arguments));
        }
      }, {
        key: "doCommit",
        value: function doCommit() {
          this.masked.doCommit();
        }
      }, {
        key: "state",
        get: function get() {
          return {
            masked: this.masked.state,
            _isFilled: this._isFilled
          };
        },
        set: function set(state) {
          this.masked.state = state.masked;
          this._isFilled = state._isFilled;
        }
      }]);

      return PatternInputDefinition;
    }();

    var PatternFixedDefinition = /*#__PURE__*/function () {
      /** */

      /** */

      /** */

      /** */
      function PatternFixedDefinition(opts) {
        _classCallCheck(this, PatternFixedDefinition);

        Object.assign(this, opts);
        this._value = '';
      }

      _createClass(PatternFixedDefinition, [{
        key: "value",
        get: function get() {
          return this._value;
        }
      }, {
        key: "unmaskedValue",
        get: function get() {
          return this.isUnmasking ? this.value : '';
        }
      }, {
        key: "reset",
        value: function reset() {
          this._isRawInput = false;
          this._value = '';
        }
      }, {
        key: "remove",
        value: function remove() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._value.length;
          this._value = this._value.slice(0, fromPos) + this._value.slice(toPos);
          if (!this._value) this._isRawInput = false;
          return new ChangeDetails();
        }
      }, {
        key: "nearestInputPos",
        value: function nearestInputPos(cursorPos) {
          var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DIRECTION.NONE;
          var minPos = 0;
          var maxPos = this._value.length;

          switch (direction) {
            case DIRECTION.LEFT:
            case DIRECTION.FORCE_LEFT:
              return minPos;

            case DIRECTION.NONE:
            case DIRECTION.RIGHT:
            case DIRECTION.FORCE_RIGHT:
            default:
              return maxPos;
          }
        }
      }, {
        key: "extractInput",
        value: function extractInput() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._value.length;
          var flags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
          return flags.raw && this._isRawInput && this._value.slice(fromPos, toPos) || '';
        }
      }, {
        key: "isComplete",
        get: function get() {
          return true;
        }
      }, {
        key: "_appendChar",
        value: function _appendChar(str) {
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var details = new ChangeDetails();
          if (this._value) return details;
          var appended = this.char === str[0];
          var isResolved = appended && (this.isUnmasking || flags.input || flags.raw) && !flags.tail;
          if (isResolved) details.rawInserted = this.char;
          this._value = details.inserted = this.char;
          this._isRawInput = isResolved && (flags.raw || flags.input);
          return details;
        }
      }, {
        key: "_appendPlaceholder",
        value: function _appendPlaceholder() {
          var details = new ChangeDetails();
          if (this._value) return details;
          this._value = details.inserted = this.char;
          return details;
        }
      }, {
        key: "extractTail",
        value: function extractTail() {
          arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
          return new ContinuousTailDetails('');
        } // $FlowFixMe no ideas

      }, {
        key: "appendTail",
        value: function appendTail(tail) {
          if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
          return tail.appendTo(this);
        }
      }, {
        key: "append",
        value: function append(str, flags, tail) {
          var details = this._appendChar(str, flags);

          if (tail != null) {
            details.tailShift += this.appendTail(tail).tailShift;
          }

          return details;
        }
      }, {
        key: "doCommit",
        value: function doCommit() {}
      }, {
        key: "state",
        get: function get() {
          return {
            _value: this._value,
            _isRawInput: this._isRawInput
          };
        },
        set: function set(state) {
          Object.assign(this, state);
        }
      }]);

      return PatternFixedDefinition;
    }();

    var _excluded$3 = ["chunks"];

    var ChunksTailDetails = /*#__PURE__*/function () {
      /** */
      function ChunksTailDetails() {
        var chunks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        _classCallCheck(this, ChunksTailDetails);

        this.chunks = chunks;
        this.from = from;
      }

      _createClass(ChunksTailDetails, [{
        key: "toString",
        value: function toString() {
          return this.chunks.map(String).join('');
        } // $FlowFixMe no ideas

      }, {
        key: "extend",
        value: function extend(tailChunk) {
          if (!String(tailChunk)) return;
          if (isString(tailChunk)) tailChunk = new ContinuousTailDetails(String(tailChunk));
          var lastChunk = this.chunks[this.chunks.length - 1];
          var extendLast = lastChunk && (lastChunk.stop === tailChunk.stop || tailChunk.stop == null) && // if tail chunk goes just after last chunk
          tailChunk.from === lastChunk.from + lastChunk.toString().length;

          if (tailChunk instanceof ContinuousTailDetails) {
            // check the ability to extend previous chunk
            if (extendLast) {
              // extend previous chunk
              lastChunk.extend(tailChunk.toString());
            } else {
              // append new chunk
              this.chunks.push(tailChunk);
            }
          } else if (tailChunk instanceof ChunksTailDetails) {
            if (tailChunk.stop == null) {
              // unwrap floating chunks to parent, keeping `from` pos
              var firstTailChunk;

              while (tailChunk.chunks.length && tailChunk.chunks[0].stop == null) {
                firstTailChunk = tailChunk.chunks.shift();
                firstTailChunk.from += tailChunk.from;
                this.extend(firstTailChunk);
              }
            } // if tail chunk still has value


            if (tailChunk.toString()) {
              // if chunks contains stops, then popup stop to container
              tailChunk.stop = tailChunk.blockIndex;
              this.chunks.push(tailChunk);
            }
          }
        }
      }, {
        key: "appendTo",
        value: function appendTo(masked) {
          // $FlowFixMe
          if (!(masked instanceof IMask.MaskedPattern)) {
            var tail = new ContinuousTailDetails(this.toString());
            return tail.appendTo(masked);
          }

          var details = new ChangeDetails();

          for (var ci = 0; ci < this.chunks.length && !details.skip; ++ci) {
            var chunk = this.chunks[ci];

            var lastBlockIter = masked._mapPosToBlock(masked.value.length);

            var stop = chunk.stop;
            var chunkBlock = void 0;

            if (stop != null && (!lastBlockIter || lastBlockIter.index <= stop)) {
              if (chunk instanceof ChunksTailDetails || // for continuous block also check if stop is exist
              masked._stops.indexOf(stop) >= 0) {
                details.aggregate(masked._appendPlaceholder(stop));
              }

              chunkBlock = chunk instanceof ChunksTailDetails && masked._blocks[stop];
            }

            if (chunkBlock) {
              var tailDetails = chunkBlock.appendTail(chunk);
              tailDetails.skip = false; // always ignore skip, it will be set on last

              details.aggregate(tailDetails);
              masked._value += tailDetails.inserted; // get not inserted chars

              var remainChars = chunk.toString().slice(tailDetails.rawInserted.length);
              if (remainChars) details.aggregate(masked.append(remainChars, {
                tail: true
              }));
            } else {
              details.aggregate(masked.append(chunk.toString(), {
                tail: true
              }));
            }
          }
          return details;
        }
      }, {
        key: "state",
        get: function get() {
          return {
            chunks: this.chunks.map(function (c) {
              return c.state;
            }),
            from: this.from,
            stop: this.stop,
            blockIndex: this.blockIndex
          };
        },
        set: function set(state) {
          var chunks = state.chunks,
              props = _objectWithoutProperties(state, _excluded$3);

          Object.assign(this, props);
          this.chunks = chunks.map(function (cstate) {
            var chunk = "chunks" in cstate ? new ChunksTailDetails() : new ContinuousTailDetails(); // $FlowFixMe already checked above

            chunk.state = cstate;
            return chunk;
          });
        }
      }, {
        key: "shiftBefore",
        value: function shiftBefore(pos) {
          if (this.from >= pos || !this.chunks.length) return '';
          var chunkShiftPos = pos - this.from;
          var ci = 0;

          while (ci < this.chunks.length) {
            var chunk = this.chunks[ci];
            var shiftChar = chunk.shiftBefore(chunkShiftPos);

            if (chunk.toString()) {
              // chunk still contains value
              // but not shifted - means no more available chars to shift
              if (!shiftChar) break;
              ++ci;
            } else {
              // clean if chunk has no value
              this.chunks.splice(ci, 1);
            }

            if (shiftChar) return shiftChar;
          }

          return '';
        }
      }]);

      return ChunksTailDetails;
    }();

    /** Masking by RegExp */

    var MaskedRegExp = /*#__PURE__*/function (_Masked) {
      _inherits(MaskedRegExp, _Masked);

      var _super = _createSuper(MaskedRegExp);

      function MaskedRegExp() {
        _classCallCheck(this, MaskedRegExp);

        return _super.apply(this, arguments);
      }

      _createClass(MaskedRegExp, [{
        key: "_update",
        value:
        /**
          @override
          @param {Object} opts
        */
        function _update(opts) {
          if (opts.mask) opts.validate = function (value) {
            return value.search(opts.mask) >= 0;
          };

          _get(_getPrototypeOf(MaskedRegExp.prototype), "_update", this).call(this, opts);
        }
      }]);

      return MaskedRegExp;
    }(Masked);
    IMask.MaskedRegExp = MaskedRegExp;

    var _excluded$2 = ["_blocks"];

    /**
      Pattern mask
      @param {Object} opts
      @param {Object} opts.blocks
      @param {Object} opts.definitions
      @param {string} opts.placeholderChar
      @param {boolean} opts.lazy
    */
    var MaskedPattern = /*#__PURE__*/function (_Masked) {
      _inherits(MaskedPattern, _Masked);

      var _super = _createSuper(MaskedPattern);

      /** */

      /** */

      /** Single char for empty input */

      /** Show placeholder only when needed */
      function MaskedPattern() {
        var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, MaskedPattern);

        // TODO type $Shape<MaskedPatternOptions>={} does not work
        opts.definitions = Object.assign({}, DEFAULT_INPUT_DEFINITIONS, opts.definitions);
        return _super.call(this, Object.assign({}, MaskedPattern.DEFAULTS, opts));
      }
      /**
        @override
        @param {Object} opts
      */


      _createClass(MaskedPattern, [{
        key: "_update",
        value: function _update() {
          var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          opts.definitions = Object.assign({}, this.definitions, opts.definitions);

          _get(_getPrototypeOf(MaskedPattern.prototype), "_update", this).call(this, opts);

          this._rebuildMask();
        }
        /** */

      }, {
        key: "_rebuildMask",
        value: function _rebuildMask() {
          var _this = this;

          var defs = this.definitions;
          this._blocks = [];
          this._stops = [];
          this._maskedBlocks = {};
          var pattern = this.mask;
          if (!pattern || !defs) return;
          var unmaskingBlock = false;
          var optionalBlock = false;

          for (var i = 0; i < pattern.length; ++i) {
            if (this.blocks) {
              var _ret = function () {
                var p = pattern.slice(i);
                var bNames = Object.keys(_this.blocks).filter(function (bName) {
                  return p.indexOf(bName) === 0;
                }); // order by key length

                bNames.sort(function (a, b) {
                  return b.length - a.length;
                }); // use block name with max length

                var bName = bNames[0];

                if (bName) {
                  // $FlowFixMe no ideas
                  var maskedBlock = createMask(Object.assign({
                    parent: _this,
                    lazy: _this.lazy,
                    placeholderChar: _this.placeholderChar,
                    overwrite: _this.overwrite
                  }, _this.blocks[bName]));

                  if (maskedBlock) {
                    _this._blocks.push(maskedBlock); // store block index


                    if (!_this._maskedBlocks[bName]) _this._maskedBlocks[bName] = [];

                    _this._maskedBlocks[bName].push(_this._blocks.length - 1);
                  }

                  i += bName.length - 1;
                  return "continue";
                }
              }();

              if (_ret === "continue") continue;
            }

            var char = pattern[i];

            var _isInput = (char in defs);

            if (char === MaskedPattern.STOP_CHAR) {
              this._stops.push(this._blocks.length);

              continue;
            }

            if (char === '{' || char === '}') {
              unmaskingBlock = !unmaskingBlock;
              continue;
            }

            if (char === '[' || char === ']') {
              optionalBlock = !optionalBlock;
              continue;
            }

            if (char === MaskedPattern.ESCAPE_CHAR) {
              ++i;
              char = pattern[i];
              if (!char) break;
              _isInput = false;
            }

            var def = _isInput ? new PatternInputDefinition({
              parent: this,
              lazy: this.lazy,
              placeholderChar: this.placeholderChar,
              mask: defs[char],
              isOptional: optionalBlock
            }) : new PatternFixedDefinition({
              char: char,
              isUnmasking: unmaskingBlock
            });

            this._blocks.push(def);
          }
        }
        /**
          @override
        */

      }, {
        key: "state",
        get: function get() {
          return Object.assign({}, _get(_getPrototypeOf(MaskedPattern.prototype), "state", this), {
            _blocks: this._blocks.map(function (b) {
              return b.state;
            })
          });
        },
        set: function set(state) {
          var _blocks = state._blocks,
              maskedState = _objectWithoutProperties(state, _excluded$2);

          this._blocks.forEach(function (b, bi) {
            return b.state = _blocks[bi];
          });

          _set(_getPrototypeOf(MaskedPattern.prototype), "state", maskedState, this, true);
        }
        /**
          @override
        */

      }, {
        key: "reset",
        value: function reset() {
          _get(_getPrototypeOf(MaskedPattern.prototype), "reset", this).call(this);

          this._blocks.forEach(function (b) {
            return b.reset();
          });
        }
        /**
          @override
        */

      }, {
        key: "isComplete",
        get: function get() {
          return this._blocks.every(function (b) {
            return b.isComplete;
          });
        }
        /**
          @override
        */

      }, {
        key: "doCommit",
        value: function doCommit() {
          this._blocks.forEach(function (b) {
            return b.doCommit();
          });

          _get(_getPrototypeOf(MaskedPattern.prototype), "doCommit", this).call(this);
        }
        /**
          @override
        */

      }, {
        key: "unmaskedValue",
        get: function get() {
          return this._blocks.reduce(function (str, b) {
            return str += b.unmaskedValue;
          }, '');
        },
        set: function set(unmaskedValue) {
          _set(_getPrototypeOf(MaskedPattern.prototype), "unmaskedValue", unmaskedValue, this, true);
        }
        /**
          @override
        */

      }, {
        key: "value",
        get: function get() {
          // TODO return _value when not in change?
          return this._blocks.reduce(function (str, b) {
            return str += b.value;
          }, '');
        },
        set: function set(value) {
          _set(_getPrototypeOf(MaskedPattern.prototype), "value", value, this, true);
        }
        /**
          @override
        */

      }, {
        key: "appendTail",
        value: function appendTail(tail) {
          return _get(_getPrototypeOf(MaskedPattern.prototype), "appendTail", this).call(this, tail).aggregate(this._appendPlaceholder());
        }
        /**
          @override
        */

      }, {
        key: "_appendCharRaw",
        value: function _appendCharRaw(ch) {
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var blockIter = this._mapPosToBlock(this.value.length);

          var details = new ChangeDetails();
          if (!blockIter) return details;

          for (var bi = blockIter.index;; ++bi) {
            var _block = this._blocks[bi];
            if (!_block) break;

            var blockDetails = _block._appendChar(ch, flags);

            var skip = blockDetails.skip;
            details.aggregate(blockDetails);
            if (skip || blockDetails.rawInserted) break; // go next char
          }

          return details;
        }
        /**
          @override
        */

      }, {
        key: "extractTail",
        value: function extractTail() {
          var _this2 = this;

          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
          var chunkTail = new ChunksTailDetails();
          if (fromPos === toPos) return chunkTail;

          this._forEachBlocksInRange(fromPos, toPos, function (b, bi, bFromPos, bToPos) {
            var blockChunk = b.extractTail(bFromPos, bToPos);
            blockChunk.stop = _this2._findStopBefore(bi);
            blockChunk.from = _this2._blockStartPos(bi);
            if (blockChunk instanceof ChunksTailDetails) blockChunk.blockIndex = bi;
            chunkTail.extend(blockChunk);
          });

          return chunkTail;
        }
        /**
          @override
        */

      }, {
        key: "extractInput",
        value: function extractInput() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
          var flags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
          if (fromPos === toPos) return '';
          var input = '';

          this._forEachBlocksInRange(fromPos, toPos, function (b, _, fromPos, toPos) {
            input += b.extractInput(fromPos, toPos, flags);
          });

          return input;
        }
      }, {
        key: "_findStopBefore",
        value: function _findStopBefore(blockIndex) {
          var stopBefore;

          for (var si = 0; si < this._stops.length; ++si) {
            var stop = this._stops[si];
            if (stop <= blockIndex) stopBefore = stop;else break;
          }

          return stopBefore;
        }
        /** Appends placeholder depending on laziness */

      }, {
        key: "_appendPlaceholder",
        value: function _appendPlaceholder(toBlockIndex) {
          var _this3 = this;

          var details = new ChangeDetails();
          if (this.lazy && toBlockIndex == null) return details;

          var startBlockIter = this._mapPosToBlock(this.value.length);

          if (!startBlockIter) return details;
          var startBlockIndex = startBlockIter.index;
          var endBlockIndex = toBlockIndex != null ? toBlockIndex : this._blocks.length;

          this._blocks.slice(startBlockIndex, endBlockIndex).forEach(function (b) {
            if (!b.lazy || toBlockIndex != null) {
              // $FlowFixMe `_blocks` may not be present
              var args = b._blocks != null ? [b._blocks.length] : [];

              var bDetails = b._appendPlaceholder.apply(b, args);

              _this3._value += bDetails.inserted;
              details.aggregate(bDetails);
            }
          });

          return details;
        }
        /** Finds block in pos */

      }, {
        key: "_mapPosToBlock",
        value: function _mapPosToBlock(pos) {
          var accVal = '';

          for (var bi = 0; bi < this._blocks.length; ++bi) {
            var _block2 = this._blocks[bi];
            var blockStartPos = accVal.length;
            accVal += _block2.value;

            if (pos <= accVal.length) {
              return {
                index: bi,
                offset: pos - blockStartPos
              };
            }
          }
        }
        /** */

      }, {
        key: "_blockStartPos",
        value: function _blockStartPos(blockIndex) {
          return this._blocks.slice(0, blockIndex).reduce(function (pos, b) {
            return pos += b.value.length;
          }, 0);
        }
        /** */

      }, {
        key: "_forEachBlocksInRange",
        value: function _forEachBlocksInRange(fromPos) {
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
          var fn = arguments.length > 2 ? arguments[2] : undefined;

          var fromBlockIter = this._mapPosToBlock(fromPos);

          if (fromBlockIter) {
            var toBlockIter = this._mapPosToBlock(toPos); // process first block


            var isSameBlock = toBlockIter && fromBlockIter.index === toBlockIter.index;
            var fromBlockStartPos = fromBlockIter.offset;
            var fromBlockEndPos = toBlockIter && isSameBlock ? toBlockIter.offset : this._blocks[fromBlockIter.index].value.length;
            fn(this._blocks[fromBlockIter.index], fromBlockIter.index, fromBlockStartPos, fromBlockEndPos);

            if (toBlockIter && !isSameBlock) {
              // process intermediate blocks
              for (var bi = fromBlockIter.index + 1; bi < toBlockIter.index; ++bi) {
                fn(this._blocks[bi], bi, 0, this._blocks[bi].value.length);
              } // process last block


              fn(this._blocks[toBlockIter.index], toBlockIter.index, 0, toBlockIter.offset);
            }
          }
        }
        /**
          @override
        */

      }, {
        key: "remove",
        value: function remove() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;

          var removeDetails = _get(_getPrototypeOf(MaskedPattern.prototype), "remove", this).call(this, fromPos, toPos);

          this._forEachBlocksInRange(fromPos, toPos, function (b, _, bFromPos, bToPos) {
            removeDetails.aggregate(b.remove(bFromPos, bToPos));
          });

          return removeDetails;
        }
        /**
          @override
        */

      }, {
        key: "nearestInputPos",
        value: function nearestInputPos(cursorPos) {
          var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DIRECTION.NONE;
          // TODO refactor - extract alignblock
          var beginBlockData = this._mapPosToBlock(cursorPos) || {
            index: 0,
            offset: 0
          };
          var beginBlockOffset = beginBlockData.offset,
              beginBlockIndex = beginBlockData.index;
          var beginBlock = this._blocks[beginBlockIndex];
          if (!beginBlock) return cursorPos;
          var beginBlockCursorPos = beginBlockOffset; // if position inside block - try to adjust it

          if (beginBlockCursorPos !== 0 && beginBlockCursorPos < beginBlock.value.length) {
            beginBlockCursorPos = beginBlock.nearestInputPos(beginBlockOffset, forceDirection(direction));
          }

          var cursorAtRight = beginBlockCursorPos === beginBlock.value.length;
          var cursorAtLeft = beginBlockCursorPos === 0; //  cursor is INSIDE first block (not at bounds)

          if (!cursorAtLeft && !cursorAtRight) return this._blockStartPos(beginBlockIndex) + beginBlockCursorPos;
          var searchBlockIndex = cursorAtRight ? beginBlockIndex + 1 : beginBlockIndex;

          if (direction === DIRECTION.NONE) {
            // NONE direction used to calculate start input position if no chars were removed
            // FOR NONE:
            // -
            // input|any
            // ->
            //  any|input
            // <-
            //  filled-input|any
            // check if first block at left is input
            if (searchBlockIndex > 0) {
              var blockIndexAtLeft = searchBlockIndex - 1;
              var blockAtLeft = this._blocks[blockIndexAtLeft];
              var blockInputPos = blockAtLeft.nearestInputPos(0, DIRECTION.NONE); // is input

              if (!blockAtLeft.value.length || blockInputPos !== blockAtLeft.value.length) {
                return this._blockStartPos(searchBlockIndex);
              }
            } // ->


            var firstInputAtRight = searchBlockIndex;

            for (var bi = firstInputAtRight; bi < this._blocks.length; ++bi) {
              var blockAtRight = this._blocks[bi];

              var _blockInputPos = blockAtRight.nearestInputPos(0, DIRECTION.NONE);

              if (!blockAtRight.value.length || _blockInputPos !== blockAtRight.value.length) {
                return this._blockStartPos(bi) + _blockInputPos;
              }
            } // <-
            // find first non-fixed symbol


            for (var _bi = searchBlockIndex - 1; _bi >= 0; --_bi) {
              var _block3 = this._blocks[_bi];

              var _blockInputPos2 = _block3.nearestInputPos(0, DIRECTION.NONE); // is input


              if (!_block3.value.length || _blockInputPos2 !== _block3.value.length) {
                return this._blockStartPos(_bi) + _block3.value.length;
              }
            }

            return cursorPos;
          }

          if (direction === DIRECTION.LEFT || direction === DIRECTION.FORCE_LEFT) {
            // -
            //  any|filled-input
            // <-
            //  any|first not empty is not-len-aligned
            //  not-0-aligned|any
            // ->
            //  any|not-len-aligned or end
            // check if first block at right is filled input
            var firstFilledBlockIndexAtRight;

            for (var _bi2 = searchBlockIndex; _bi2 < this._blocks.length; ++_bi2) {
              if (this._blocks[_bi2].value) {
                firstFilledBlockIndexAtRight = _bi2;
                break;
              }
            }

            if (firstFilledBlockIndexAtRight != null) {
              var filledBlock = this._blocks[firstFilledBlockIndexAtRight];

              var _blockInputPos3 = filledBlock.nearestInputPos(0, DIRECTION.RIGHT);

              if (_blockInputPos3 === 0 && filledBlock.unmaskedValue.length) {
                // filled block is input
                return this._blockStartPos(firstFilledBlockIndexAtRight) + _blockInputPos3;
              }
            } // <-
            // find this vars


            var firstFilledInputBlockIndex = -1;
            var firstEmptyInputBlockIndex; // TODO consider nested empty inputs

            for (var _bi3 = searchBlockIndex - 1; _bi3 >= 0; --_bi3) {
              var _block4 = this._blocks[_bi3];

              var _blockInputPos4 = _block4.nearestInputPos(_block4.value.length, DIRECTION.FORCE_LEFT);

              if (!_block4.value || _blockInputPos4 !== 0) firstEmptyInputBlockIndex = _bi3;

              if (_blockInputPos4 !== 0) {
                if (_blockInputPos4 !== _block4.value.length) {
                  // aligned inside block - return immediately
                  return this._blockStartPos(_bi3) + _blockInputPos4;
                } else {
                  // found filled
                  firstFilledInputBlockIndex = _bi3;
                  break;
                }
              }
            }

            if (direction === DIRECTION.LEFT) {
              // try find first empty input before start searching position only when not forced
              for (var _bi4 = firstFilledInputBlockIndex + 1; _bi4 <= Math.min(searchBlockIndex, this._blocks.length - 1); ++_bi4) {
                var _block5 = this._blocks[_bi4];

                var _blockInputPos5 = _block5.nearestInputPos(0, DIRECTION.NONE);

                var blockAlignedPos = this._blockStartPos(_bi4) + _blockInputPos5;

                if (blockAlignedPos > cursorPos) break; // if block is not lazy input

                if (_blockInputPos5 !== _block5.value.length) return blockAlignedPos;
              }
            } // process overflow


            if (firstFilledInputBlockIndex >= 0) {
              return this._blockStartPos(firstFilledInputBlockIndex) + this._blocks[firstFilledInputBlockIndex].value.length;
            } // for lazy if has aligned left inside fixed and has came to the start - use start position


            if (direction === DIRECTION.FORCE_LEFT || this.lazy && !this.extractInput() && !isInput(this._blocks[searchBlockIndex])) {
              return 0;
            }

            if (firstEmptyInputBlockIndex != null) {
              return this._blockStartPos(firstEmptyInputBlockIndex);
            } // find first input


            for (var _bi5 = searchBlockIndex; _bi5 < this._blocks.length; ++_bi5) {
              var _block6 = this._blocks[_bi5];

              var _blockInputPos6 = _block6.nearestInputPos(0, DIRECTION.NONE); // is input


              if (!_block6.value.length || _blockInputPos6 !== _block6.value.length) {
                return this._blockStartPos(_bi5) + _blockInputPos6;
              }
            }

            return 0;
          }

          if (direction === DIRECTION.RIGHT || direction === DIRECTION.FORCE_RIGHT) {
            // ->
            //  any|not-len-aligned and filled
            //  any|not-len-aligned
            // <-
            //  not-0-aligned or start|any
            var firstInputBlockAlignedIndex;
            var firstInputBlockAlignedPos;

            for (var _bi6 = searchBlockIndex; _bi6 < this._blocks.length; ++_bi6) {
              var _block7 = this._blocks[_bi6];

              var _blockInputPos7 = _block7.nearestInputPos(0, DIRECTION.NONE);

              if (_blockInputPos7 !== _block7.value.length) {
                firstInputBlockAlignedPos = this._blockStartPos(_bi6) + _blockInputPos7;
                firstInputBlockAlignedIndex = _bi6;
                break;
              }
            }

            if (firstInputBlockAlignedIndex != null && firstInputBlockAlignedPos != null) {
              for (var _bi7 = firstInputBlockAlignedIndex; _bi7 < this._blocks.length; ++_bi7) {
                var _block8 = this._blocks[_bi7];

                var _blockInputPos8 = _block8.nearestInputPos(0, DIRECTION.FORCE_RIGHT);

                if (_blockInputPos8 !== _block8.value.length) {
                  return this._blockStartPos(_bi7) + _blockInputPos8;
                }
              }

              return direction === DIRECTION.FORCE_RIGHT ? this.value.length : firstInputBlockAlignedPos;
            }

            for (var _bi8 = Math.min(searchBlockIndex, this._blocks.length - 1); _bi8 >= 0; --_bi8) {
              var _block9 = this._blocks[_bi8];

              var _blockInputPos9 = _block9.nearestInputPos(_block9.value.length, DIRECTION.LEFT);

              if (_blockInputPos9 !== 0) {
                var alignedPos = this._blockStartPos(_bi8) + _blockInputPos9;

                if (alignedPos >= cursorPos) return alignedPos;
                break;
              }
            }
          }

          return cursorPos;
        }
        /** Get block by name */

      }, {
        key: "maskedBlock",
        value: function maskedBlock(name) {
          return this.maskedBlocks(name)[0];
        }
        /** Get all blocks by name */

      }, {
        key: "maskedBlocks",
        value: function maskedBlocks(name) {
          var _this4 = this;

          var indices = this._maskedBlocks[name];
          if (!indices) return [];
          return indices.map(function (gi) {
            return _this4._blocks[gi];
          });
        }
      }]);

      return MaskedPattern;
    }(Masked);
    MaskedPattern.DEFAULTS = {
      lazy: true,
      placeholderChar: '_'
    };
    MaskedPattern.STOP_CHAR = '`';
    MaskedPattern.ESCAPE_CHAR = '\\';
    MaskedPattern.InputDefinition = PatternInputDefinition;
    MaskedPattern.FixedDefinition = PatternFixedDefinition;

    function isInput(block) {
      if (!block) return false;
      var value = block.value;
      return !value || block.nearestInputPos(0, DIRECTION.NONE) !== value.length;
    }

    IMask.MaskedPattern = MaskedPattern;

    /** Pattern which accepts ranges */

    var MaskedRange = /*#__PURE__*/function (_MaskedPattern) {
      _inherits(MaskedRange, _MaskedPattern);

      var _super = _createSuper(MaskedRange);

      function MaskedRange() {
        _classCallCheck(this, MaskedRange);

        return _super.apply(this, arguments);
      }

      _createClass(MaskedRange, [{
        key: "_matchFrom",
        get:
        /**
          Optionally sets max length of pattern.
          Used when pattern length is longer then `to` param length. Pads zeros at start in this case.
        */

        /** Min bound */

        /** Max bound */

        /** */
        function get() {
          return this.maxLength - String(this.from).length;
        }
        /**
          @override
        */

      }, {
        key: "_update",
        value: function _update(opts) {
          // TODO type
          opts = Object.assign({
            to: this.to || 0,
            from: this.from || 0
          }, opts);
          var maxLength = String(opts.to).length;
          if (opts.maxLength != null) maxLength = Math.max(maxLength, opts.maxLength);
          opts.maxLength = maxLength;
          var fromStr = String(opts.from).padStart(maxLength, '0');
          var toStr = String(opts.to).padStart(maxLength, '0');
          var sameCharsCount = 0;

          while (sameCharsCount < toStr.length && toStr[sameCharsCount] === fromStr[sameCharsCount]) {
            ++sameCharsCount;
          }

          opts.mask = toStr.slice(0, sameCharsCount).replace(/0/g, '\\0') + '0'.repeat(maxLength - sameCharsCount);

          _get(_getPrototypeOf(MaskedRange.prototype), "_update", this).call(this, opts);
        }
        /**
          @override
        */

      }, {
        key: "isComplete",
        get: function get() {
          return _get(_getPrototypeOf(MaskedRange.prototype), "isComplete", this) && Boolean(this.value);
        }
      }, {
        key: "boundaries",
        value: function boundaries(str) {
          var minstr = '';
          var maxstr = '';

          var _ref = str.match(/^(\D*)(\d*)(\D*)/) || [],
              _ref2 = _slicedToArray(_ref, 3),
              placeholder = _ref2[1],
              num = _ref2[2];

          if (num) {
            minstr = '0'.repeat(placeholder.length) + num;
            maxstr = '9'.repeat(placeholder.length) + num;
          }

          minstr = minstr.padEnd(this.maxLength, '0');
          maxstr = maxstr.padEnd(this.maxLength, '9');
          return [minstr, maxstr];
        }
        /**
          @override
        */

      }, {
        key: "doPrepare",
        value: function doPrepare(str) {
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          str = _get(_getPrototypeOf(MaskedRange.prototype), "doPrepare", this).call(this, str, flags).replace(/\D/g, '');
          if (!this.autofix) return str;
          var fromStr = String(this.from).padStart(this.maxLength, '0');
          var toStr = String(this.to).padStart(this.maxLength, '0');
          var val = this.value;
          var prepStr = '';

          for (var ci = 0; ci < str.length; ++ci) {
            var nextVal = val + prepStr + str[ci];

            var _this$boundaries = this.boundaries(nextVal),
                _this$boundaries2 = _slicedToArray(_this$boundaries, 2),
                minstr = _this$boundaries2[0],
                maxstr = _this$boundaries2[1];

            if (Number(maxstr) < this.from) prepStr += fromStr[nextVal.length - 1];else if (Number(minstr) > this.to) prepStr += toStr[nextVal.length - 1];else prepStr += str[ci];
          }

          return prepStr;
        }
        /**
          @override
        */

      }, {
        key: "doValidate",
        value: function doValidate() {
          var _get2;

          var str = this.value;
          var firstNonZero = str.search(/[^0]/);
          if (firstNonZero === -1 && str.length <= this._matchFrom) return true;

          var _this$boundaries3 = this.boundaries(str),
              _this$boundaries4 = _slicedToArray(_this$boundaries3, 2),
              minstr = _this$boundaries4[0],
              maxstr = _this$boundaries4[1];

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return this.from <= Number(maxstr) && Number(minstr) <= this.to && (_get2 = _get(_getPrototypeOf(MaskedRange.prototype), "doValidate", this)).call.apply(_get2, [this].concat(args));
        }
      }]);

      return MaskedRange;
    }(MaskedPattern);
    IMask.MaskedRange = MaskedRange;

    /** Date mask */

    var MaskedDate = /*#__PURE__*/function (_MaskedPattern) {
      _inherits(MaskedDate, _MaskedPattern);

      var _super = _createSuper(MaskedDate);

      /** Pattern mask for date according to {@link MaskedDate#format} */

      /** Start date */

      /** End date */

      /** */

      /**
        @param {Object} opts
      */
      function MaskedDate(opts) {
        _classCallCheck(this, MaskedDate);

        return _super.call(this, Object.assign({}, MaskedDate.DEFAULTS, opts));
      }
      /**
        @override
      */


      _createClass(MaskedDate, [{
        key: "_update",
        value: function _update(opts) {
          if (opts.mask === Date) delete opts.mask;
          if (opts.pattern) opts.mask = opts.pattern;
          var blocks = opts.blocks;
          opts.blocks = Object.assign({}, MaskedDate.GET_DEFAULT_BLOCKS()); // adjust year block

          if (opts.min) opts.blocks.Y.from = opts.min.getFullYear();
          if (opts.max) opts.blocks.Y.to = opts.max.getFullYear();

          if (opts.min && opts.max && opts.blocks.Y.from === opts.blocks.Y.to) {
            opts.blocks.m.from = opts.min.getMonth() + 1;
            opts.blocks.m.to = opts.max.getMonth() + 1;

            if (opts.blocks.m.from === opts.blocks.m.to) {
              opts.blocks.d.from = opts.min.getDate();
              opts.blocks.d.to = opts.max.getDate();
            }
          }

          Object.assign(opts.blocks, blocks); // add autofix

          Object.keys(opts.blocks).forEach(function (bk) {
            var b = opts.blocks[bk];
            if (!('autofix' in b)) b.autofix = opts.autofix;
          });

          _get(_getPrototypeOf(MaskedDate.prototype), "_update", this).call(this, opts);
        }
        /**
          @override
        */

      }, {
        key: "doValidate",
        value: function doValidate() {
          var _get2;

          var date = this.date;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return (_get2 = _get(_getPrototypeOf(MaskedDate.prototype), "doValidate", this)).call.apply(_get2, [this].concat(args)) && (!this.isComplete || this.isDateExist(this.value) && date != null && (this.min == null || this.min <= date) && (this.max == null || date <= this.max));
        }
        /** Checks if date is exists */

      }, {
        key: "isDateExist",
        value: function isDateExist(str) {
          return this.format(this.parse(str, this), this).indexOf(str) >= 0;
        }
        /** Parsed Date */

      }, {
        key: "date",
        get: function get() {
          return this.typedValue;
        },
        set: function set(date) {
          this.typedValue = date;
        }
        /**
          @override
        */

      }, {
        key: "typedValue",
        get: function get() {
          return this.isComplete ? _get(_getPrototypeOf(MaskedDate.prototype), "typedValue", this) : null;
        },
        set: function set(value) {
          _set(_getPrototypeOf(MaskedDate.prototype), "typedValue", value, this, true);
        }
      }]);

      return MaskedDate;
    }(MaskedPattern);
    MaskedDate.DEFAULTS = {
      pattern: 'd{.}`m{.}`Y',
      format: function format(date) {
        var day = String(date.getDate()).padStart(2, '0');
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var year = date.getFullYear();
        return [day, month, year].join('.');
      },
      parse: function parse(str) {
        var _str$split = str.split('.'),
            _str$split2 = _slicedToArray(_str$split, 3),
            day = _str$split2[0],
            month = _str$split2[1],
            year = _str$split2[2];

        return new Date(year, month - 1, day);
      }
    };

    MaskedDate.GET_DEFAULT_BLOCKS = function () {
      return {
        d: {
          mask: MaskedRange,
          from: 1,
          to: 31,
          maxLength: 2
        },
        m: {
          mask: MaskedRange,
          from: 1,
          to: 12,
          maxLength: 2
        },
        Y: {
          mask: MaskedRange,
          from: 1900,
          to: 9999
        }
      };
    };

    IMask.MaskedDate = MaskedDate;

    /**
      Generic element API to use with mask
      @interface
    */
    var MaskElement = /*#__PURE__*/function () {
      function MaskElement() {
        _classCallCheck(this, MaskElement);
      }

      _createClass(MaskElement, [{
        key: "selectionStart",
        get:
        /** */

        /** */

        /** */

        /** Safely returns selection start */
        function get() {
          var start;

          try {
            start = this._unsafeSelectionStart;
          } catch (e) {}

          return start != null ? start : this.value.length;
        }
        /** Safely returns selection end */

      }, {
        key: "selectionEnd",
        get: function get() {
          var end;

          try {
            end = this._unsafeSelectionEnd;
          } catch (e) {}

          return end != null ? end : this.value.length;
        }
        /** Safely sets element selection */

      }, {
        key: "select",
        value: function select(start, end) {
          if (start == null || end == null || start === this.selectionStart && end === this.selectionEnd) return;

          try {
            this._unsafeSelect(start, end);
          } catch (e) {}
        }
        /** Should be overriden in subclasses */

      }, {
        key: "_unsafeSelect",
        value: function _unsafeSelect(start, end) {}
        /** Should be overriden in subclasses */

      }, {
        key: "isActive",
        get: function get() {
          return false;
        }
        /** Should be overriden in subclasses */

      }, {
        key: "bindEvents",
        value: function bindEvents(handlers) {}
        /** Should be overriden in subclasses */

      }, {
        key: "unbindEvents",
        value: function unbindEvents() {}
      }]);

      return MaskElement;
    }();
    IMask.MaskElement = MaskElement;

    /** Bridge between HTMLElement and {@link Masked} */

    var HTMLMaskElement = /*#__PURE__*/function (_MaskElement) {
      _inherits(HTMLMaskElement, _MaskElement);

      var _super = _createSuper(HTMLMaskElement);

      /** Mapping between HTMLElement events and mask internal events */

      /** HTMLElement to use mask on */

      /**
        @param {HTMLInputElement|HTMLTextAreaElement} input
      */
      function HTMLMaskElement(input) {
        var _this;

        _classCallCheck(this, HTMLMaskElement);

        _this = _super.call(this);
        _this.input = input;
        _this._handlers = {};
        return _this;
      }
      /** */
      // $FlowFixMe https://github.com/facebook/flow/issues/2839


      _createClass(HTMLMaskElement, [{
        key: "rootElement",
        get: function get() {
          return this.input.getRootNode ? this.input.getRootNode() : document;
        }
        /**
          Is element in focus
          @readonly
        */

      }, {
        key: "isActive",
        get: function get() {
          //$FlowFixMe
          return this.input === this.rootElement.activeElement;
        }
        /**
          Returns HTMLElement selection start
          @override
        */

      }, {
        key: "_unsafeSelectionStart",
        get: function get() {
          return this.input.selectionStart;
        }
        /**
          Returns HTMLElement selection end
          @override
        */

      }, {
        key: "_unsafeSelectionEnd",
        get: function get() {
          return this.input.selectionEnd;
        }
        /**
          Sets HTMLElement selection
          @override
        */

      }, {
        key: "_unsafeSelect",
        value: function _unsafeSelect(start, end) {
          this.input.setSelectionRange(start, end);
        }
        /**
          HTMLElement value
          @override
        */

      }, {
        key: "value",
        get: function get() {
          return this.input.value;
        },
        set: function set(value) {
          this.input.value = value;
        }
        /**
          Binds HTMLElement events to mask internal events
          @override
        */

      }, {
        key: "bindEvents",
        value: function bindEvents(handlers) {
          var _this2 = this;

          Object.keys(handlers).forEach(function (event) {
            return _this2._toggleEventHandler(HTMLMaskElement.EVENTS_MAP[event], handlers[event]);
          });
        }
        /**
          Unbinds HTMLElement events to mask internal events
          @override
        */

      }, {
        key: "unbindEvents",
        value: function unbindEvents() {
          var _this3 = this;

          Object.keys(this._handlers).forEach(function (event) {
            return _this3._toggleEventHandler(event);
          });
        }
        /** */

      }, {
        key: "_toggleEventHandler",
        value: function _toggleEventHandler(event, handler) {
          if (this._handlers[event]) {
            this.input.removeEventListener(event, this._handlers[event]);
            delete this._handlers[event];
          }

          if (handler) {
            this.input.addEventListener(event, handler);
            this._handlers[event] = handler;
          }
        }
      }]);

      return HTMLMaskElement;
    }(MaskElement);
    HTMLMaskElement.EVENTS_MAP = {
      selectionChange: 'keydown',
      input: 'input',
      drop: 'drop',
      click: 'click',
      focus: 'focus',
      commit: 'blur'
    };
    IMask.HTMLMaskElement = HTMLMaskElement;

    var HTMLContenteditableMaskElement = /*#__PURE__*/function (_HTMLMaskElement) {
      _inherits(HTMLContenteditableMaskElement, _HTMLMaskElement);

      var _super = _createSuper(HTMLContenteditableMaskElement);

      function HTMLContenteditableMaskElement() {
        _classCallCheck(this, HTMLContenteditableMaskElement);

        return _super.apply(this, arguments);
      }

      _createClass(HTMLContenteditableMaskElement, [{
        key: "_unsafeSelectionStart",
        get:
        /**
          Returns HTMLElement selection start
          @override
        */
        function get() {
          var root = this.rootElement;
          var selection = root.getSelection && root.getSelection();
          return selection && selection.anchorOffset;
        }
        /**
          Returns HTMLElement selection end
          @override
        */

      }, {
        key: "_unsafeSelectionEnd",
        get: function get() {
          var root = this.rootElement;
          var selection = root.getSelection && root.getSelection();
          return selection && this._unsafeSelectionStart + String(selection).length;
        }
        /**
          Sets HTMLElement selection
          @override
        */

      }, {
        key: "_unsafeSelect",
        value: function _unsafeSelect(start, end) {
          if (!this.rootElement.createRange) return;
          var range = this.rootElement.createRange();
          range.setStart(this.input.firstChild || this.input, start);
          range.setEnd(this.input.lastChild || this.input, end);
          var root = this.rootElement;
          var selection = root.getSelection && root.getSelection();

          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        /**
          HTMLElement value
          @override
        */

      }, {
        key: "value",
        get: function get() {
          // $FlowFixMe
          return this.input.textContent;
        },
        set: function set(value) {
          this.input.textContent = value;
        }
      }]);

      return HTMLContenteditableMaskElement;
    }(HTMLMaskElement);
    IMask.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;

    var _excluded$1 = ["mask"];
    /** Listens to element events and controls changes between element and {@link Masked} */

    var InputMask = /*#__PURE__*/function () {
      /**
        View element
        @readonly
      */

      /**
        Internal {@link Masked} model
        @readonly
      */

      /**
        @param {MaskElement|HTMLInputElement|HTMLTextAreaElement} el
        @param {Object} opts
      */
      function InputMask(el, opts) {
        _classCallCheck(this, InputMask);

        this.el = el instanceof MaskElement ? el : el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' ? new HTMLContenteditableMaskElement(el) : new HTMLMaskElement(el);
        this.masked = createMask(opts);
        this._listeners = {};
        this._value = '';
        this._unmaskedValue = '';
        this._saveSelection = this._saveSelection.bind(this);
        this._onInput = this._onInput.bind(this);
        this._onChange = this._onChange.bind(this);
        this._onDrop = this._onDrop.bind(this);
        this._onFocus = this._onFocus.bind(this);
        this._onClick = this._onClick.bind(this);
        this.alignCursor = this.alignCursor.bind(this);
        this.alignCursorFriendly = this.alignCursorFriendly.bind(this);

        this._bindEvents(); // refresh


        this.updateValue();

        this._onChange();
      }
      /** Read or update mask */


      _createClass(InputMask, [{
        key: "mask",
        get: function get() {
          return this.masked.mask;
        },
        set: function set(mask) {
          if (this.maskEquals(mask)) return;

          if (!(mask instanceof IMask.Masked) && this.masked.constructor === maskedClass(mask)) {
            this.masked.updateOptions({
              mask: mask
            });
            return;
          }

          var masked = createMask({
            mask: mask
          });
          masked.unmaskedValue = this.masked.unmaskedValue;
          this.masked = masked;
        }
        /** Raw value */

      }, {
        key: "maskEquals",
        value: function maskEquals(mask) {
          return mask == null || mask === this.masked.mask || mask === Date && this.masked instanceof MaskedDate;
        }
      }, {
        key: "value",
        get: function get() {
          return this._value;
        },
        set: function set(str) {
          this.masked.value = str;
          this.updateControl();
          this.alignCursor();
        }
        /** Unmasked value */

      }, {
        key: "unmaskedValue",
        get: function get() {
          return this._unmaskedValue;
        },
        set: function set(str) {
          this.masked.unmaskedValue = str;
          this.updateControl();
          this.alignCursor();
        }
        /** Typed unmasked value */

      }, {
        key: "typedValue",
        get: function get() {
          return this.masked.typedValue;
        },
        set: function set(val) {
          this.masked.typedValue = val;
          this.updateControl();
          this.alignCursor();
        }
        /**
          Starts listening to element events
          @protected
        */

      }, {
        key: "_bindEvents",
        value: function _bindEvents() {
          this.el.bindEvents({
            selectionChange: this._saveSelection,
            input: this._onInput,
            drop: this._onDrop,
            click: this._onClick,
            focus: this._onFocus,
            commit: this._onChange
          });
        }
        /**
          Stops listening to element events
          @protected
         */

      }, {
        key: "_unbindEvents",
        value: function _unbindEvents() {
          if (this.el) this.el.unbindEvents();
        }
        /**
          Fires custom event
          @protected
         */

      }, {
        key: "_fireEvent",
        value: function _fireEvent(ev) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          var listeners = this._listeners[ev];
          if (!listeners) return;
          listeners.forEach(function (l) {
            return l.apply(void 0, args);
          });
        }
        /**
          Current selection start
          @readonly
        */

      }, {
        key: "selectionStart",
        get: function get() {
          return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
        }
        /** Current cursor position */

      }, {
        key: "cursorPos",
        get: function get() {
          return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
        },
        set: function set(pos) {
          if (!this.el || !this.el.isActive) return;
          this.el.select(pos, pos);

          this._saveSelection();
        }
        /**
          Stores current selection
          @protected
        */

      }, {
        key: "_saveSelection",
        value: function _saveSelection() {
          if (this.value !== this.el.value) {
            console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'); // eslint-disable-line no-console
          }

          this._selection = {
            start: this.selectionStart,
            end: this.cursorPos
          };
        }
        /** Syncronizes model value from view */

      }, {
        key: "updateValue",
        value: function updateValue() {
          this.masked.value = this.el.value;
          this._value = this.masked.value;
        }
        /** Syncronizes view from model value, fires change events */

      }, {
        key: "updateControl",
        value: function updateControl() {
          var newUnmaskedValue = this.masked.unmaskedValue;
          var newValue = this.masked.value;
          var isChanged = this.unmaskedValue !== newUnmaskedValue || this.value !== newValue;
          this._unmaskedValue = newUnmaskedValue;
          this._value = newValue;
          if (this.el.value !== newValue) this.el.value = newValue;
          if (isChanged) this._fireChangeEvents();
        }
        /** Updates options with deep equal check, recreates @{link Masked} model if mask type changes */

      }, {
        key: "updateOptions",
        value: function updateOptions(opts) {
          var mask = opts.mask,
              restOpts = _objectWithoutProperties(opts, _excluded$1);

          var updateMask = !this.maskEquals(mask);
          var updateOpts = !objectIncludes(this.masked, restOpts);
          if (updateMask) this.mask = mask;
          if (updateOpts) this.masked.updateOptions(restOpts);
          if (updateMask || updateOpts) this.updateControl();
        }
        /** Updates cursor */

      }, {
        key: "updateCursor",
        value: function updateCursor(cursorPos) {
          if (cursorPos == null) return;
          this.cursorPos = cursorPos; // also queue change cursor for mobile browsers

          this._delayUpdateCursor(cursorPos);
        }
        /**
          Delays cursor update to support mobile browsers
          @private
        */

      }, {
        key: "_delayUpdateCursor",
        value: function _delayUpdateCursor(cursorPos) {
          var _this = this;

          this._abortUpdateCursor();

          this._changingCursorPos = cursorPos;
          this._cursorChanging = setTimeout(function () {
            if (!_this.el) return; // if was destroyed

            _this.cursorPos = _this._changingCursorPos;

            _this._abortUpdateCursor();
          }, 10);
        }
        /**
          Fires custom events
          @protected
        */

      }, {
        key: "_fireChangeEvents",
        value: function _fireChangeEvents() {
          this._fireEvent('accept', this._inputEvent);

          if (this.masked.isComplete) this._fireEvent('complete', this._inputEvent);
        }
        /**
          Aborts delayed cursor update
          @private
        */

      }, {
        key: "_abortUpdateCursor",
        value: function _abortUpdateCursor() {
          if (this._cursorChanging) {
            clearTimeout(this._cursorChanging);
            delete this._cursorChanging;
          }
        }
        /** Aligns cursor to nearest available position */

      }, {
        key: "alignCursor",
        value: function alignCursor() {
          this.cursorPos = this.masked.nearestInputPos(this.cursorPos, DIRECTION.LEFT);
        }
        /** Aligns cursor only if selection is empty */

      }, {
        key: "alignCursorFriendly",
        value: function alignCursorFriendly() {
          if (this.selectionStart !== this.cursorPos) return; // skip if range is selected

          this.alignCursor();
        }
        /** Adds listener on custom event */

      }, {
        key: "on",
        value: function on(ev, handler) {
          if (!this._listeners[ev]) this._listeners[ev] = [];

          this._listeners[ev].push(handler);

          return this;
        }
        /** Removes custom event listener */

      }, {
        key: "off",
        value: function off(ev, handler) {
          if (!this._listeners[ev]) return this;

          if (!handler) {
            delete this._listeners[ev];
            return this;
          }

          var hIndex = this._listeners[ev].indexOf(handler);

          if (hIndex >= 0) this._listeners[ev].splice(hIndex, 1);
          return this;
        }
        /** Handles view input event */

      }, {
        key: "_onInput",
        value: function _onInput(e) {
          this._inputEvent = e;

          this._abortUpdateCursor(); // fix strange IE behavior


          if (!this._selection) return this.updateValue();
          var details = new ActionDetails( // new state
          this.el.value, this.cursorPos, // old state
          this.value, this._selection);
          var oldRawValue = this.masked.rawInputValue;
          var offset = this.masked.splice(details.startChangePos, details.removed.length, details.inserted, details.removeDirection).offset; // force align in remove direction only if no input chars were removed
          // otherwise we still need to align with NONE (to get out from fixed symbols for instance)

          var removeDirection = oldRawValue === this.masked.rawInputValue ? details.removeDirection : DIRECTION.NONE;
          var cursorPos = this.masked.nearestInputPos(details.startChangePos + offset, removeDirection);
          this.updateControl();
          this.updateCursor(cursorPos);
          delete this._inputEvent;
        }
        /** Handles view change event and commits model value */

      }, {
        key: "_onChange",
        value: function _onChange() {
          if (this.value !== this.el.value) {
            this.updateValue();
          }

          this.masked.doCommit();
          this.updateControl();

          this._saveSelection();
        }
        /** Handles view drop event, prevents by default */

      }, {
        key: "_onDrop",
        value: function _onDrop(ev) {
          ev.preventDefault();
          ev.stopPropagation();
        }
        /** Restore last selection on focus */

      }, {
        key: "_onFocus",
        value: function _onFocus(ev) {
          this.alignCursorFriendly();
        }
        /** Restore last selection on focus */

      }, {
        key: "_onClick",
        value: function _onClick(ev) {
          this.alignCursorFriendly();
        }
        /** Unbind view events and removes element reference */

      }, {
        key: "destroy",
        value: function destroy() {
          this._unbindEvents(); // $FlowFixMe why not do so?


          this._listeners.length = 0; // $FlowFixMe

          delete this.el;
        }
      }]);

      return InputMask;
    }();
    IMask.InputMask = InputMask;

    /** Pattern which validates enum values */

    var MaskedEnum = /*#__PURE__*/function (_MaskedPattern) {
      _inherits(MaskedEnum, _MaskedPattern);

      var _super = _createSuper(MaskedEnum);

      function MaskedEnum() {
        _classCallCheck(this, MaskedEnum);

        return _super.apply(this, arguments);
      }

      _createClass(MaskedEnum, [{
        key: "_update",
        value:
        /**
          @override
          @param {Object} opts
        */
        function _update(opts) {
          // TODO type
          if (opts.enum) opts.mask = '*'.repeat(opts.enum[0].length);

          _get(_getPrototypeOf(MaskedEnum.prototype), "_update", this).call(this, opts);
        }
        /**
          @override
        */

      }, {
        key: "doValidate",
        value: function doValidate() {
          var _this = this,
              _get2;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return this.enum.some(function (e) {
            return e.indexOf(_this.unmaskedValue) >= 0;
          }) && (_get2 = _get(_getPrototypeOf(MaskedEnum.prototype), "doValidate", this)).call.apply(_get2, [this].concat(args));
        }
      }]);

      return MaskedEnum;
    }(MaskedPattern);
    IMask.MaskedEnum = MaskedEnum;

    /**
      Number mask
      @param {Object} opts
      @param {string} opts.radix - Single char
      @param {string} opts.thousandsSeparator - Single char
      @param {Array<string>} opts.mapToRadix - Array of single chars
      @param {number} opts.min
      @param {number} opts.max
      @param {number} opts.scale - Digits after point
      @param {boolean} opts.signed - Allow negative
      @param {boolean} opts.normalizeZeros - Flag to remove leading and trailing zeros in the end of editing
      @param {boolean} opts.padFractionalZeros - Flag to pad trailing zeros after point in the end of editing
    */
    var MaskedNumber = /*#__PURE__*/function (_Masked) {
      _inherits(MaskedNumber, _Masked);

      var _super = _createSuper(MaskedNumber);

      /** Single char */

      /** Single char */

      /** Array of single chars */

      /** */

      /** */

      /** Digits after point */

      /** */

      /** Flag to remove leading and trailing zeros in the end of editing */

      /** Flag to pad trailing zeros after point in the end of editing */
      function MaskedNumber(opts) {
        _classCallCheck(this, MaskedNumber);

        return _super.call(this, Object.assign({}, MaskedNumber.DEFAULTS, opts));
      }
      /**
        @override
      */


      _createClass(MaskedNumber, [{
        key: "_update",
        value: function _update(opts) {
          _get(_getPrototypeOf(MaskedNumber.prototype), "_update", this).call(this, opts);

          this._updateRegExps();
        }
        /** */

      }, {
        key: "_updateRegExps",
        value: function _updateRegExps() {
          // use different regexp to process user input (more strict, input suffix) and tail shifting
          var start = '^' + (this.allowNegative ? '[+|\\-]?' : '');
          var midInput = '(0|([1-9]+\\d*))?';
          var mid = '\\d*';
          var end = (this.scale ? '(' + escapeRegExp(this.radix) + '\\d{0,' + this.scale + '})?' : '') + '$';
          this._numberRegExpInput = new RegExp(start + midInput + end);
          this._numberRegExp = new RegExp(start + mid + end);
          this._mapToRadixRegExp = new RegExp('[' + this.mapToRadix.map(escapeRegExp).join('') + ']', 'g');
          this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
        }
        /** */

      }, {
        key: "_removeThousandsSeparators",
        value: function _removeThousandsSeparators(value) {
          return value.replace(this._thousandsSeparatorRegExp, '');
        }
        /** */

      }, {
        key: "_insertThousandsSeparators",
        value: function _insertThousandsSeparators(value) {
          // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
          var parts = value.split(this.radix);
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
          return parts.join(this.radix);
        }
        /**
          @override
        */

      }, {
        key: "doPrepare",
        value: function doPrepare(str) {
          var _get2;

          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          return (_get2 = _get(_getPrototypeOf(MaskedNumber.prototype), "doPrepare", this)).call.apply(_get2, [this, this._removeThousandsSeparators(str.replace(this._mapToRadixRegExp, this.radix))].concat(args));
        }
        /** */

      }, {
        key: "_separatorsCount",
        value: function _separatorsCount(to) {
          var extendOnSeparators = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          var count = 0;

          for (var pos = 0; pos < to; ++pos) {
            if (this._value.indexOf(this.thousandsSeparator, pos) === pos) {
              ++count;
              if (extendOnSeparators) to += this.thousandsSeparator.length;
            }
          }

          return count;
        }
        /** */

      }, {
        key: "_separatorsCountFromSlice",
        value: function _separatorsCountFromSlice() {
          var slice = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._value;
          return this._separatorsCount(this._removeThousandsSeparators(slice).length, true);
        }
        /**
          @override
        */

      }, {
        key: "extractInput",
        value: function extractInput() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;
          var flags = arguments.length > 2 ? arguments[2] : undefined;

          var _this$_adjustRangeWit = this._adjustRangeWithSeparators(fromPos, toPos);

          var _this$_adjustRangeWit2 = _slicedToArray(_this$_adjustRangeWit, 2);

          fromPos = _this$_adjustRangeWit2[0];
          toPos = _this$_adjustRangeWit2[1];
          return this._removeThousandsSeparators(_get(_getPrototypeOf(MaskedNumber.prototype), "extractInput", this).call(this, fromPos, toPos, flags));
        }
        /**
          @override
        */

      }, {
        key: "_appendCharRaw",
        value: function _appendCharRaw(ch) {
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          if (!this.thousandsSeparator) return _get(_getPrototypeOf(MaskedNumber.prototype), "_appendCharRaw", this).call(this, ch, flags);
          var prevBeforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;

          var prevBeforeTailSeparatorsCount = this._separatorsCountFromSlice(prevBeforeTailValue);

          this._value = this._removeThousandsSeparators(this.value);

          var appendDetails = _get(_getPrototypeOf(MaskedNumber.prototype), "_appendCharRaw", this).call(this, ch, flags);

          this._value = this._insertThousandsSeparators(this._value);
          var beforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;

          var beforeTailSeparatorsCount = this._separatorsCountFromSlice(beforeTailValue);

          appendDetails.tailShift += (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length;
          appendDetails.skip = !appendDetails.rawInserted && ch === this.thousandsSeparator;
          return appendDetails;
        }
        /** */

      }, {
        key: "_findSeparatorAround",
        value: function _findSeparatorAround(pos) {
          if (this.thousandsSeparator) {
            var searchFrom = pos - this.thousandsSeparator.length + 1;
            var separatorPos = this.value.indexOf(this.thousandsSeparator, searchFrom);
            if (separatorPos <= pos) return separatorPos;
          }

          return -1;
        }
      }, {
        key: "_adjustRangeWithSeparators",
        value: function _adjustRangeWithSeparators(from, to) {
          var separatorAroundFromPos = this._findSeparatorAround(from);

          if (separatorAroundFromPos >= 0) from = separatorAroundFromPos;

          var separatorAroundToPos = this._findSeparatorAround(to);

          if (separatorAroundToPos >= 0) to = separatorAroundToPos + this.thousandsSeparator.length;
          return [from, to];
        }
        /**
          @override
        */

      }, {
        key: "remove",
        value: function remove() {
          var fromPos = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var toPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.value.length;

          var _this$_adjustRangeWit3 = this._adjustRangeWithSeparators(fromPos, toPos);

          var _this$_adjustRangeWit4 = _slicedToArray(_this$_adjustRangeWit3, 2);

          fromPos = _this$_adjustRangeWit4[0];
          toPos = _this$_adjustRangeWit4[1];
          var valueBeforePos = this.value.slice(0, fromPos);
          var valueAfterPos = this.value.slice(toPos);

          var prevBeforeTailSeparatorsCount = this._separatorsCount(valueBeforePos.length);

          this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(valueBeforePos + valueAfterPos));

          var beforeTailSeparatorsCount = this._separatorsCountFromSlice(valueBeforePos);

          return new ChangeDetails({
            tailShift: (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length
          });
        }
        /**
          @override
        */

      }, {
        key: "nearestInputPos",
        value: function nearestInputPos(cursorPos, direction) {
          if (!this.thousandsSeparator) return cursorPos;

          switch (direction) {
            case DIRECTION.NONE:
            case DIRECTION.LEFT:
            case DIRECTION.FORCE_LEFT:
              {
                var separatorAtLeftPos = this._findSeparatorAround(cursorPos - 1);

                if (separatorAtLeftPos >= 0) {
                  var separatorAtLeftEndPos = separatorAtLeftPos + this.thousandsSeparator.length;

                  if (cursorPos < separatorAtLeftEndPos || this.value.length <= separatorAtLeftEndPos || direction === DIRECTION.FORCE_LEFT) {
                    return separatorAtLeftPos;
                  }
                }

                break;
              }

            case DIRECTION.RIGHT:
            case DIRECTION.FORCE_RIGHT:
              {
                var separatorAtRightPos = this._findSeparatorAround(cursorPos);

                if (separatorAtRightPos >= 0) {
                  return separatorAtRightPos + this.thousandsSeparator.length;
                }
              }
          }

          return cursorPos;
        }
        /**
          @override
        */

      }, {
        key: "doValidate",
        value: function doValidate(flags) {
          var regexp = flags.input ? this._numberRegExpInput : this._numberRegExp; // validate as string

          var valid = regexp.test(this._removeThousandsSeparators(this.value));

          if (valid) {
            // validate as number
            var number = this.number;
            valid = valid && !isNaN(number) && (this.min == null || this.min >= 0 || this.min <= this.number) && (this.max == null || this.max <= 0 || this.number <= this.max);
          }

          return valid && _get(_getPrototypeOf(MaskedNumber.prototype), "doValidate", this).call(this, flags);
        }
        /**
          @override
        */

      }, {
        key: "doCommit",
        value: function doCommit() {
          if (this.value) {
            var number = this.number;
            var validnum = number; // check bounds

            if (this.min != null) validnum = Math.max(validnum, this.min);
            if (this.max != null) validnum = Math.min(validnum, this.max);
            if (validnum !== number) this.unmaskedValue = String(validnum);
            var formatted = this.value;
            if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
            if (this.padFractionalZeros) formatted = this._padFractionalZeros(formatted);
            this._value = formatted;
          }

          _get(_getPrototypeOf(MaskedNumber.prototype), "doCommit", this).call(this);
        }
        /** */

      }, {
        key: "_normalizeZeros",
        value: function _normalizeZeros(value) {
          var parts = this._removeThousandsSeparators(value).split(this.radix); // remove leading zeros


          parts[0] = parts[0].replace(/^(\D*)(0*)(\d*)/, function (match, sign, zeros, num) {
            return sign + num;
          }); // add leading zero

          if (value.length && !/\d$/.test(parts[0])) parts[0] = parts[0] + '0';

          if (parts.length > 1) {
            parts[1] = parts[1].replace(/0*$/, ''); // remove trailing zeros

            if (!parts[1].length) parts.length = 1; // remove fractional
          }

          return this._insertThousandsSeparators(parts.join(this.radix));
        }
        /** */

      }, {
        key: "_padFractionalZeros",
        value: function _padFractionalZeros(value) {
          if (!value) return value;
          var parts = value.split(this.radix);
          if (parts.length < 2) parts.push('');
          parts[1] = parts[1].padEnd(this.scale, '0');
          return parts.join(this.radix);
        }
        /**
          @override
        */

      }, {
        key: "unmaskedValue",
        get: function get() {
          return this._removeThousandsSeparators(this._normalizeZeros(this.value)).replace(this.radix, '.');
        },
        set: function set(unmaskedValue) {
          _set(_getPrototypeOf(MaskedNumber.prototype), "unmaskedValue", unmaskedValue.replace('.', this.radix), this, true);
        }
        /**
          @override
        */

      }, {
        key: "typedValue",
        get: function get() {
          return Number(this.unmaskedValue);
        },
        set: function set(n) {
          _set(_getPrototypeOf(MaskedNumber.prototype), "unmaskedValue", String(n), this, true);
        }
        /** Parsed Number */

      }, {
        key: "number",
        get: function get() {
          return this.typedValue;
        },
        set: function set(number) {
          this.typedValue = number;
        }
        /**
          Is negative allowed
          @readonly
        */

      }, {
        key: "allowNegative",
        get: function get() {
          return this.signed || this.min != null && this.min < 0 || this.max != null && this.max < 0;
        }
      }]);

      return MaskedNumber;
    }(Masked);
    MaskedNumber.DEFAULTS = {
      radix: ',',
      thousandsSeparator: '',
      mapToRadix: ['.'],
      scale: 2,
      signed: false,
      normalizeZeros: true,
      padFractionalZeros: false
    };
    IMask.MaskedNumber = MaskedNumber;

    /** Masking by custom Function */

    var MaskedFunction = /*#__PURE__*/function (_Masked) {
      _inherits(MaskedFunction, _Masked);

      var _super = _createSuper(MaskedFunction);

      function MaskedFunction() {
        _classCallCheck(this, MaskedFunction);

        return _super.apply(this, arguments);
      }

      _createClass(MaskedFunction, [{
        key: "_update",
        value:
        /**
          @override
          @param {Object} opts
        */
        function _update(opts) {
          if (opts.mask) opts.validate = opts.mask;

          _get(_getPrototypeOf(MaskedFunction.prototype), "_update", this).call(this, opts);
        }
      }]);

      return MaskedFunction;
    }(Masked);
    IMask.MaskedFunction = MaskedFunction;

    var _excluded = ["compiledMasks", "currentMaskRef", "currentMask"];

    /** Dynamic mask for choosing apropriate mask in run-time */
    var MaskedDynamic = /*#__PURE__*/function (_Masked) {
      _inherits(MaskedDynamic, _Masked);

      var _super = _createSuper(MaskedDynamic);

      /** Currently chosen mask */

      /** Compliled {@link Masked} options */

      /** Chooses {@link Masked} depending on input value */

      /**
        @param {Object} opts
      */
      function MaskedDynamic(opts) {
        var _this;

        _classCallCheck(this, MaskedDynamic);

        _this = _super.call(this, Object.assign({}, MaskedDynamic.DEFAULTS, opts));
        _this.currentMask = null;
        return _this;
      }
      /**
        @override
      */


      _createClass(MaskedDynamic, [{
        key: "_update",
        value: function _update(opts) {
          _get(_getPrototypeOf(MaskedDynamic.prototype), "_update", this).call(this, opts);

          if ('mask' in opts) {
            // mask could be totally dynamic with only `dispatch` option
            this.compiledMasks = Array.isArray(opts.mask) ? opts.mask.map(function (m) {
              return createMask(m);
            }) : [];
          }
        }
        /**
          @override
        */

      }, {
        key: "_appendCharRaw",
        value: function _appendCharRaw(ch) {
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var details = this._applyDispatch(ch, flags);

          if (this.currentMask) {
            details.aggregate(this.currentMask._appendChar(ch, flags));
          }

          return details;
        }
      }, {
        key: "_applyDispatch",
        value: function _applyDispatch() {
          var appended = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var prevValueBeforeTail = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._value : this.value;
          var inputValue = this.rawInputValue;
          var insertValue = flags.tail && flags._beforeTailState != null ? // $FlowFixMe - tired to fight with type system
          flags._beforeTailState._rawInputValue : inputValue;
          var tailValue = inputValue.slice(insertValue.length);
          var prevMask = this.currentMask;
          var details = new ChangeDetails();
          var prevMaskState = prevMask && prevMask.state; // clone flags to prevent overwriting `_beforeTailState`

          this.currentMask = this.doDispatch(appended, Object.assign({}, flags)); // restore state after dispatch

          if (this.currentMask) {
            if (this.currentMask !== prevMask) {
              // if mask changed reapply input
              this.currentMask.reset();

              if (insertValue) {
                // $FlowFixMe - it's ok, we don't change current mask above
                var d = this.currentMask.append(insertValue, {
                  raw: true
                });
                details.tailShift = d.inserted.length - prevValueBeforeTail.length;
              }

              if (tailValue) {
                // $FlowFixMe - it's ok, we don't change current mask above
                details.tailShift += this.currentMask.append(tailValue, {
                  raw: true,
                  tail: true
                }).tailShift;
              }
            } else {
              // Dispatch can do something bad with state, so
              // restore prev mask state
              this.currentMask.state = prevMaskState;
            }
          }

          return details;
        }
      }, {
        key: "_appendPlaceholder",
        value: function _appendPlaceholder() {
          var details = this._applyDispatch.apply(this, arguments);

          if (this.currentMask) {
            details.aggregate(this.currentMask._appendPlaceholder());
          }

          return details;
        }
        /**
          @override
        */

      }, {
        key: "doDispatch",
        value: function doDispatch(appended) {
          var flags = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          return this.dispatch(appended, this, flags);
        }
        /**
          @override
        */

      }, {
        key: "doValidate",
        value: function doValidate() {
          var _get2, _this$currentMask;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return (_get2 = _get(_getPrototypeOf(MaskedDynamic.prototype), "doValidate", this)).call.apply(_get2, [this].concat(args)) && (!this.currentMask || (_this$currentMask = this.currentMask).doValidate.apply(_this$currentMask, args));
        }
        /**
          @override
        */

      }, {
        key: "reset",
        value: function reset() {
          if (this.currentMask) this.currentMask.reset();
          this.compiledMasks.forEach(function (m) {
            return m.reset();
          });
        }
        /**
          @override
        */

      }, {
        key: "value",
        get: function get() {
          return this.currentMask ? this.currentMask.value : '';
        },
        set: function set(value) {
          _set(_getPrototypeOf(MaskedDynamic.prototype), "value", value, this, true);
        }
        /**
          @override
        */

      }, {
        key: "unmaskedValue",
        get: function get() {
          return this.currentMask ? this.currentMask.unmaskedValue : '';
        },
        set: function set(unmaskedValue) {
          _set(_getPrototypeOf(MaskedDynamic.prototype), "unmaskedValue", unmaskedValue, this, true);
        }
        /**
          @override
        */

      }, {
        key: "typedValue",
        get: function get() {
          return this.currentMask ? this.currentMask.typedValue : '';
        } // probably typedValue should not be used with dynamic
        ,
        set: function set(value) {
          var unmaskedValue = String(value); // double check it

          if (this.currentMask) {
            this.currentMask.typedValue = value;
            unmaskedValue = this.currentMask.unmaskedValue;
          }

          this.unmaskedValue = unmaskedValue;
        }
        /**
          @override
        */

      }, {
        key: "isComplete",
        get: function get() {
          return !!this.currentMask && this.currentMask.isComplete;
        }
        /**
          @override
        */

      }, {
        key: "remove",
        value: function remove() {
          var details = new ChangeDetails();

          if (this.currentMask) {
            var _this$currentMask2;

            details.aggregate((_this$currentMask2 = this.currentMask).remove.apply(_this$currentMask2, arguments)) // update with dispatch
            .aggregate(this._applyDispatch());
          }

          return details;
        }
        /**
          @override
        */

      }, {
        key: "state",
        get: function get() {
          return Object.assign({}, _get(_getPrototypeOf(MaskedDynamic.prototype), "state", this), {
            _rawInputValue: this.rawInputValue,
            compiledMasks: this.compiledMasks.map(function (m) {
              return m.state;
            }),
            currentMaskRef: this.currentMask,
            currentMask: this.currentMask && this.currentMask.state
          });
        },
        set: function set(state) {
          var compiledMasks = state.compiledMasks,
              currentMaskRef = state.currentMaskRef,
              currentMask = state.currentMask,
              maskedState = _objectWithoutProperties(state, _excluded);

          this.compiledMasks.forEach(function (m, mi) {
            return m.state = compiledMasks[mi];
          });

          if (currentMaskRef != null) {
            this.currentMask = currentMaskRef;
            this.currentMask.state = currentMask;
          }

          _set(_getPrototypeOf(MaskedDynamic.prototype), "state", maskedState, this, true);
        }
        /**
          @override
        */

      }, {
        key: "extractInput",
        value: function extractInput() {
          var _this$currentMask3;

          return this.currentMask ? (_this$currentMask3 = this.currentMask).extractInput.apply(_this$currentMask3, arguments) : '';
        }
        /**
          @override
        */

      }, {
        key: "extractTail",
        value: function extractTail() {
          var _this$currentMask4, _get3;

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return this.currentMask ? (_this$currentMask4 = this.currentMask).extractTail.apply(_this$currentMask4, args) : (_get3 = _get(_getPrototypeOf(MaskedDynamic.prototype), "extractTail", this)).call.apply(_get3, [this].concat(args));
        }
        /**
          @override
        */

      }, {
        key: "doCommit",
        value: function doCommit() {
          if (this.currentMask) this.currentMask.doCommit();

          _get(_getPrototypeOf(MaskedDynamic.prototype), "doCommit", this).call(this);
        }
        /**
          @override
        */

      }, {
        key: "nearestInputPos",
        value: function nearestInputPos() {
          var _this$currentMask5, _get4;

          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          return this.currentMask ? (_this$currentMask5 = this.currentMask).nearestInputPos.apply(_this$currentMask5, args) : (_get4 = _get(_getPrototypeOf(MaskedDynamic.prototype), "nearestInputPos", this)).call.apply(_get4, [this].concat(args));
        }
      }, {
        key: "overwrite",
        get: function get() {
          return this.currentMask ? this.currentMask.overwrite : _get(_getPrototypeOf(MaskedDynamic.prototype), "overwrite", this);
        },
        set: function set(overwrite) {
          console.warn('"overwrite" option is not available in dynamic mask, use this option in siblings');
        }
      }]);

      return MaskedDynamic;
    }(Masked);
    MaskedDynamic.DEFAULTS = {
      dispatch: function dispatch(appended, masked, flags) {
        if (!masked.compiledMasks.length) return;
        var inputValue = masked.rawInputValue; // simulate input

        var inputs = masked.compiledMasks.map(function (m, index) {
          m.reset();
          m.append(inputValue, {
            raw: true
          });
          m.append(appended, flags);
          var weight = m.rawInputValue.length;
          return {
            weight: weight,
            index: index
          };
        }); // pop masks with longer values first

        inputs.sort(function (i1, i2) {
          return i2.weight - i1.weight;
        });
        return masked.compiledMasks[inputs[0].index];
      }
    };
    IMask.MaskedDynamic = MaskedDynamic;

    /** Mask pipe source and destination types */

    var PIPE_TYPE = {
      MASKED: 'value',
      UNMASKED: 'unmaskedValue',
      TYPED: 'typedValue'
    };
    /** Creates new pipe function depending on mask type, source and destination options */

    function createPipe(mask) {
      var from = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : PIPE_TYPE.MASKED;
      var to = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : PIPE_TYPE.MASKED;
      var masked = createMask(mask);
      return function (value) {
        return masked.runIsolated(function (m) {
          m[from] = value;
          return m[to];
        });
      };
    }
    /** Pipes value through mask depending on mask type, source and destination options */

    function pipe(value) {
      for (var _len = arguments.length, pipeArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        pipeArgs[_key - 1] = arguments[_key];
      }

      return createPipe.apply(void 0, pipeArgs)(value);
    }
    IMask.PIPE_TYPE = PIPE_TYPE;
    IMask.createPipe = createPipe;
    IMask.pipe = pipe;

    try {
      globalThis.IMask = IMask;
    } catch (e) {}

    function fire(el, name, detail) {
    	const e = new CustomEvent(name, { detail });
    	el.dispatchEvent(e);
    }

    function imask(node, options) {

    	let imask;

    	function destroy() {
    		imask && imask.destroy();
    	}

    	function update(options) {
    		if ( ! options) return imask && destroy();
    		if (imask) return imask.updateOptions(options);
    		imask = new IMask(node, options);
    		imask.on('accept', () => fire(node, 'accept', imask));
    		imask.on('complete', () => fire(node, 'complete', imask));
    	}

    	update(options);

    	return { update, destroy };
    }

    var svelte = /*#__PURE__*/Object.freeze({
        __proto__: null,
        SvelteComponent: SvelteComponentDev,
        SvelteComponentTyped: SvelteComponentTyped,
        afterUpdate: afterUpdate,
        beforeUpdate: beforeUpdate,
        createEventDispatcher: createEventDispatcher,
        getAllContexts: getAllContexts,
        getContext: getContext,
        hasContext: hasContext,
        onDestroy: onDestroy,
        onMount: onMount,
        setContext: setContext,
        tick: tick
    });

    /* src\UI\Input.svelte generated by Svelte v3.42.4 */
    const file$d = "src\\UI\\Input.svelte";

    // (69:1) {:else}
    function create_else_block$1(ctx) {
    	let input;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", /*type*/ ctx[5]);
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[4]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(input, "class", "svelte-sbduyb");
    			add_location(input, file$d, 69, 2, 1289);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*type*/ 32) {
    				attr_dev(input, "type", /*type*/ ctx[5]);
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(input, "name", /*name*/ ctx[4]);
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(69:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:28) 
    function create_if_block_3(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", /*type*/ ctx[5]);
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[4]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(input, "class", "svelte-sbduyb");
    			add_location(input, file$d, 63, 2, 1167);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = action_destroyer(imask.call(null, input, /*options*/ ctx[7]));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*type*/ 32) {
    				attr_dev(input, "type", /*type*/ ctx[5]);
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(input, "name", /*name*/ ctx[4]);
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(63:28) ",
    		ctx
    	});

    	return block;
    }

    // (58:31) 
    function create_if_block_2$1(ctx) {
    	let input;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", /*type*/ ctx[5]);
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[4]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			input.required = true;
    			attr_dev(input, "class", "svelte-sbduyb");
    			add_location(input, file$d, 58, 2, 1043);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*type*/ 32) {
    				attr_dev(input, "type", /*type*/ ctx[5]);
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(input, "name", /*name*/ ctx[4]);
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(58:31) ",
    		ctx
    	});

    	return block;
    }

    // (55:34) 
    function create_if_block_1$1(ctx) {
    	let input;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[4]);
    			input.multiple = true;
    			attr_dev(input, "class", "svelte-sbduyb");
    			add_location(input, file$d, 55, 2, 960);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(input, "name", /*name*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(55:34) ",
    		ctx
    	});

    	return block;
    }

    // (51:1) {#if controlType === 'textarea'}
    function create_if_block$1(ctx) {
    	let textarea;

    	const block = {
    		c: function create() {
    			textarea = element("textarea");
    			attr_dev(textarea, "rows", /*rows*/ ctx[3]);
    			attr_dev(textarea, "id", /*id*/ ctx[1]);
    			attr_dev(textarea, "name", /*name*/ ctx[4]);
    			attr_dev(textarea, "placeholder", /*placeholder*/ ctx[2]);
    			attr_dev(textarea, "class", "svelte-sbduyb");
    			add_location(textarea, file$d, 51, 2, 849);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, textarea, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows*/ 8) {
    				attr_dev(textarea, "rows", /*rows*/ ctx[3]);
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(textarea, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 16) {
    				attr_dev(textarea, "name", /*name*/ ctx[4]);
    			}

    			if (dirty & /*placeholder*/ 4) {
    				attr_dev(textarea, "placeholder", /*placeholder*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(textarea);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(51:1) {#if controlType === 'textarea'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*controlType*/ ctx[0] === 'textarea') return create_if_block$1;
    		if (/*controlType*/ ctx[0] === 'file') return create_if_block_1$1;
    		if (/*required*/ ctx[6] === 'true') return create_if_block_2$1;
    		if (/*name*/ ctx[4] === 'phone') return create_if_block_3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "form-control svelte-sbduyb");
    			add_location(div, file$d, 49, 0, 784);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Input', slots, []);
    	let { controlType = null } = $$props;
    	let { id } = $$props;
    	let { placeholder = "" } = $$props;
    	let { rows = null } = $$props;
    	let { name = null } = $$props;
    	let { type = "" } = $$props;
    	let { required = null } = $$props;
    	const options = { mask: '+{7} (000) 000-00-00' };
    	const writable_props = ['controlType', 'id', 'placeholder', 'rows', 'name', 'type', 'required'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Input> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('controlType' in $$props) $$invalidate(0, controlType = $$props.controlType);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('rows' in $$props) $$invalidate(3, rows = $$props.rows);
    		if ('name' in $$props) $$invalidate(4, name = $$props.name);
    		if ('type' in $$props) $$invalidate(5, type = $$props.type);
    		if ('required' in $$props) $$invalidate(6, required = $$props.required);
    	};

    	$$self.$capture_state = () => ({
    		imask,
    		controlType,
    		id,
    		placeholder,
    		rows,
    		name,
    		type,
    		required,
    		options
    	});

    	$$self.$inject_state = $$props => {
    		if ('controlType' in $$props) $$invalidate(0, controlType = $$props.controlType);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('placeholder' in $$props) $$invalidate(2, placeholder = $$props.placeholder);
    		if ('rows' in $$props) $$invalidate(3, rows = $$props.rows);
    		if ('name' in $$props) $$invalidate(4, name = $$props.name);
    		if ('type' in $$props) $$invalidate(5, type = $$props.type);
    		if ('required' in $$props) $$invalidate(6, required = $$props.required);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [controlType, id, placeholder, rows, name, type, required, options];
    }

    class Input extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			controlType: 0,
    			id: 1,
    			placeholder: 2,
    			rows: 3,
    			name: 4,
    			type: 5,
    			required: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Input",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[1] === undefined && !('id' in props)) {
    			console.warn("<Input> was created without expected prop 'id'");
    		}
    	}

    	get controlType() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set controlType(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rows() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rows(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Input>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Input>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Block\PrivacyModal.svelte generated by Svelte v3.42.4 */

    const file$c = "src\\Block\\PrivacyModal.svelte";

    function create_fragment$c(ctx) {
    	let h2;
    	let t0;
    	let t1;
    	let p0;
    	let t2;
    	let br0;
    	let t3;
    	let br1;
    	let t4;
    	let br2;
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let br3;
    	let t8;
    	let br4;
    	let t9;
    	let br5;
    	let t10;
    	let br6;
    	let t11;
    	let br7;
    	let t12;
    	let br8;
    	let t13;
    	let br9;
    	let t14;
    	let br10;
    	let t15;
    	let br11;
    	let t16;
    	let br12;
    	let t17;
    	let br13;
    	let t18;
    	let br14;
    	let t19;
    	let br15;
    	let t20;
    	let br16;
    	let t21;
    	let t22;
    	let p2;
    	let t23;
    	let br17;
    	let t24;
    	let br18;
    	let t25;
    	let br19;
    	let t26;
    	let br20;
    	let t27;
    	let br21;
    	let t28;
    	let br22;
    	let t29;
    	let br23;
    	let t30;
    	let br24;
    	let t31;
    	let br25;
    	let t32;
    	let br26;
    	let t33;
    	let br27;
    	let t34;
    	let br28;
    	let t35;
    	let br29;
    	let t36;
    	let t37;
    	let p3;
    	let t38;
    	let br30;
    	let t39;
    	let br31;
    	let t40;
    	let br32;
    	let t41;
    	let br33;
    	let t42;
    	let br34;
    	let t43;
    	let br35;
    	let t44;
    	let br36;
    	let t45;
    	let br37;
    	let t46;
    	let br38;
    	let t47;
    	let br39;
    	let t48;
    	let br40;
    	let t49;
    	let t50;
    	let p4;
    	let t51;
    	let br41;
    	let t52;
    	let br42;
    	let t53;
    	let br43;
    	let t54;
    	let br44;
    	let t55;
    	let br45;
    	let t56;
    	let br46;
    	let t57;
    	let br47;
    	let t58;
    	let br48;
    	let t59;
    	let br49;
    	let t60;
    	let br50;
    	let t61;
    	let br51;
    	let t62;
    	let br52;
    	let t63;
    	let t64;
    	let p5;
    	let t65;
    	let br53;
    	let t66;
    	let br54;
    	let t67;
    	let br55;
    	let t68;
    	let br56;
    	let t69;
    	let br57;
    	let t70;
    	let br58;
    	let t71;
    	let br59;
    	let t72;
    	let t73;
    	let p6;
    	let t74;
    	let br60;
    	let t75;
    	let br61;
    	let t76;
    	let br62;
    	let t77;
    	let br63;
    	let t78;
    	let br64;
    	let t79;
    	let t80;
    	let p7;
    	let t81;
    	let br65;
    	let t82;
    	let br66;
    	let t83;
    	let br67;
    	let t84;
    	let br68;
    	let t85;
    	let br69;
    	let t86;
    	let br70;
    	let t87;
    	let br71;
    	let t88;
    	let t89;
    	let p8;
    	let t90;
    	let br72;
    	let t91;
    	let br73;
    	let t92;
    	let br74;
    	let t93;
    	let br75;
    	let t94;
    	let br76;
    	let t95;
    	let br77;
    	let t96;
    	let br78;
    	let t97;
    	let t98;
    	let p9;
    	let t99;
    	let br79;
    	let t100;
    	let br80;
    	let t101;
    	let br81;
    	let t102;
    	let br82;
    	let t103;
    	let br83;
    	let t104;
    	let br84;
    	let t105;
    	let br85;
    	let t106;
    	let br86;
    	let t107;
    	let br87;
    	let t108;
    	let br88;
    	let t109;
    	let br89;
    	let t110;
    	let t111;
    	let p10;
    	let t112;
    	let br90;
    	let t113;
    	let br91;
    	let t114;
    	let t115;
    	let p11;
    	let t116;
    	let br92;
    	let t117;
    	let br93;
    	let t118;
    	let t119;
    	let p12;
    	let t120;
    	let br94;
    	let t121;
    	let t122;
    	let p13;
    	let t123;
    	let br95;
    	let t124;
    	let br96;
    	let t125;
    	let br97;
    	let t126;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			p0 = element("p");
    			t2 = text("1. Общие положения\r\n");
    			br0 = element("br");
    			t3 = text("Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» (далее - Закон о персональных данных) и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые ООО «Иванов и Ко» (далее – Оператор).\r\n");
    			br1 = element("br");
    			t4 = text("1.1. Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.\r\n");
    			br2 = element("br");
    			t5 = text("1.2. Настоящая политика Оператора в отношении обработки персональных данных (далее – Политика) применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта https://site.ru.");
    			t6 = space();
    			p1 = element("p");
    			t7 = text("2. Основные понятия, используемые в Политике\r\n");
    			br3 = element("br");
    			t8 = text("2.1. Автоматизированная обработка персональных данных – обработка персональных данных с помощью средств вычислительной техники.\r\n");
    			br4 = element("br");
    			t9 = text("2.2. Блокирование персональных данных – временное прекращение обработки персональных данных (за исключением случаев, если обработка необходима для уточнения персональных данных).\r\n");
    			br5 = element("br");
    			t10 = text("2.3. Веб-сайт – совокупность графических и информационных материалов, а также программ для ЭВМ и баз данных, обеспечивающих их доступность в сети интернет по сетевому адресу https://site.ru.\r\n");
    			br6 = element("br");
    			t11 = text("2.4. Информационная система персональных данных — совокупность содержащихся в базах данных персональных данных, и обеспечивающих их обработку информационных технологий и технических средств.\r\n");
    			br7 = element("br");
    			t12 = text("2.5. Обезличивание персональных данных — действия, в результате которых невозможно определить без использования дополнительной информации принадлежность персональных данных конкретному Пользователю или иному субъекту персональных данных.\r\n");
    			br8 = element("br");
    			t13 = text("2.6. Обработка персональных данных – любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных.\r\n");
    			br9 = element("br");
    			t14 = text("2.7. Оператор – государственный орган, муниципальный орган, юридическое или физическое лицо, самостоятельно или совместно с другими лицами организующие и (или) осуществляющие обработку персональных данных, а также определяющие цели обработки персональных данных, состав персональных данных, подлежащих обработке, действия (операции), совершаемые с персональными данными.\r\n");
    			br10 = element("br");
    			t15 = text("2.8. Персональные данные – любая информация, относящаяся прямо или косвенно к определенному или определяемому Пользователю веб-сайта https://site.ru.\r\n");
    			br11 = element("br");
    			t16 = text("2.9. Персональные данные, разрешенные субъектом персональных данных для распространения, - персональные данные, доступ неограниченного круга лиц к которым предоставлен субъектом персональных данных путем дачи согласия на обработку персональных данных, разрешенных субъектом персональных данных для распространения в порядке, предусмотренном Законом о персональных данных (далее - персональные данные, разрешенные для распространения).\r\n");
    			br12 = element("br");
    			t17 = text("2.10. Пользователь – любой посетитель веб-сайта https://site.ru.\r\n");
    			br13 = element("br");
    			t18 = text("2.11. Предоставление персональных данных – действия, направленные на раскрытие персональных данных определенному лицу или определенному кругу лиц.\r\n");
    			br14 = element("br");
    			t19 = text("2.12. Распространение персональных данных – любые действия, направленные на раскрытие персональных данных неопределенному кругу лиц (передача персональных данных) или на ознакомление с персональными данными неограниченного круга лиц, в том числе обнародование персональных данных в средствах массовой информации, размещение в информационно-телекоммуникационных сетях или предоставление доступа к персональным данным каким-либо иным способом.\r\n");
    			br15 = element("br");
    			t20 = text("2.13. Трансграничная передача персональных данных – передача персональных данных на территорию иностранного государства органу власти иностранного государства, иностранному физическому или иностранному юридическому лицу.\r\n");
    			br16 = element("br");
    			t21 = text("2.14. Уничтожение персональных данных – любые действия, в результате которых персональные данные уничтожаются безвозвратно с невозможностью дальнейшего восстановления содержания персональных данных в информационной системе персональных данных и (или) уничтожаются материальные носители персональных данных.");
    			t22 = space();
    			p2 = element("p");
    			t23 = text("3. Основные права и обязанности Оператора\r\n");
    			br17 = element("br");
    			t24 = text("3.1. Оператор имеет право:\r\n");
    			br18 = element("br");
    			t25 = text("– получать от субъекта персональных данных достоверные информацию и/или документы, содержащие персональные данные;\r\n");
    			br19 = element("br");
    			t26 = text("– в случае отзыва субъектом персональных данных согласия на обработку персональных данных Оператор вправе продолжить обработку персональных данных без согласия субъекта персональных данных при наличии оснований, указанных в Законе о персональных данных;\r\n");
    			br20 = element("br");
    			t27 = text("– самостоятельно определять состав и перечень мер, необходимых и достаточных для обеспечения выполнения обязанностей, предусмотренных Законом о персональных данных и принятыми в соответствии с ним нормативными правовыми актами, если иное не предусмотрено Законом о персональных данных или другими федеральными законами.\r\n");
    			br21 = element("br");
    			t28 = text("3.2. Оператор обязан:\r\n");
    			br22 = element("br");
    			t29 = text("– предоставлять субъекту персональных данных по его просьбе информацию, касающуюся обработки его персональных данных;\r\n");
    			br23 = element("br");
    			t30 = text("– организовывать обработку персональных данных в порядке, установленном действующим законодательством РФ;\r\n");
    			br24 = element("br");
    			t31 = text("– отвечать на обращения и запросы субъектов персональных данных и их законных представителей в соответствии с требованиями Закона о персональных данных;\r\n");
    			br25 = element("br");
    			t32 = text("– сообщать в уполномоченный орган по защите прав субъектов персональных данных по запросу этого органа необходимую информацию в течение 30 дней с даты получения такого запроса;\r\n");
    			br26 = element("br");
    			t33 = text("– публиковать или иным образом обеспечивать неограниченный доступ к настоящей Политике в отношении обработки персональных данных;\r\n");
    			br27 = element("br");
    			t34 = text("– принимать правовые, организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа к ним, уничтожения, изменения, блокирования, копирования, предоставления, распространения персональных данных, а также от иных неправомерных действий в отношении персональных данных;\r\n");
    			br28 = element("br");
    			t35 = text("– прекратить передачу (распространение, предоставление, доступ) персональных данных, прекратить обработку и уничтожить персональные данные в порядке и случаях, предусмотренных Законом о персональных данных;\r\n");
    			br29 = element("br");
    			t36 = text("– исполнять иные обязанности, предусмотренные Законом о персональных данных.");
    			t37 = space();
    			p3 = element("p");
    			t38 = text("4. Основные права и обязанности субъектов персональных данных\r\n");
    			br30 = element("br");
    			t39 = text("4.1. Субъекты персональных данных имеют право:\r\n");
    			br31 = element("br");
    			t40 = text("– получать информацию, касающуюся обработки его персональных данных, за исключением случаев, предусмотренных федеральными законами. Сведения предоставляются субъекту персональных данных Оператором в доступной форме, и в них не должны содержаться персональные данные, относящиеся к другим субъектам персональных данных, за исключением случаев, когда имеются законные основания для раскрытия таких персональных данных. Перечень информации и порядок ее получения установлен Законом о персональных данных;\r\n");
    			br32 = element("br");
    			t41 = text("– требовать от оператора уточнения его персональных данных, их блокирования или уничтожения в случае, если персональные данные являются неполными, устаревшими, неточными, незаконно полученными или не являются необходимыми для заявленной цели обработки, а также принимать предусмотренные законом меры по защите своих прав;\r\n");
    			br33 = element("br");
    			t42 = text("– выдвигать условие предварительного согласия при обработке персональных данных в целях продвижения на рынке товаров, работ и услуг;\r\n");
    			br34 = element("br");
    			t43 = text("– на отзыв согласия на обработку персональных данных;\r\n");
    			br35 = element("br");
    			t44 = text("– обжаловать в уполномоченный орган по защите прав субъектов персональных данных или в судебном порядке неправомерные действия или бездействие Оператора при обработке его персональных данных;\r\n");
    			br36 = element("br");
    			t45 = text("– на осуществление иных прав, предусмотренных законодательством РФ.\r\n");
    			br37 = element("br");
    			t46 = text("4.2. Субъекты персональных данных обязаны:\r\n");
    			br38 = element("br");
    			t47 = text("– предоставлять Оператору достоверные данные о себе;\r\n");
    			br39 = element("br");
    			t48 = text("– сообщать Оператору об уточнении (обновлении, изменении) своих персональных данных.\r\n");
    			br40 = element("br");
    			t49 = text("4.3. Лица, передавшие Оператору недостоверные сведения о себе, либо сведения о другом субъекте персональных данных без согласия последнего, несут ответственность в соответствии с законодательством РФ.");
    			t50 = space();
    			p4 = element("p");
    			t51 = text("5. Оператор может обрабатывать следующие персональные данные Пользователя\r\n");
    			br41 = element("br");
    			t52 = text("5.1. Фамилия, имя, отчество.\r\n");
    			br42 = element("br");
    			t53 = text("5.2. Электронный адрес.\r\n");
    			br43 = element("br");
    			t54 = text("5.3. Номера телефонов.\r\n");
    			br44 = element("br");
    			t55 = text("5.4. Также на сайте происходит сбор и обработка обезличенных данных о посетителях (в т.ч. файлов «cookie») с помощью сервисов интернет-статистики (Яндекс Метрика и Гугл Аналитика и других).\r\n");
    			br45 = element("br");
    			t56 = text("5.5. Вышеперечисленные данные далее по тексту Политики объединены общим понятием Персональные данные.\r\n");
    			br46 = element("br");
    			t57 = text("5.6. Обработка специальных категорий персональных данных, касающихся расовой, национальной принадлежности, политических взглядов, религиозных или философских убеждений, интимной жизни, Оператором не осуществляется.\r\n");
    			br47 = element("br");
    			t58 = text("5.7. Обработка персональных данных, разрешенных для распространения, из числа специальных категорий персональных данных, указанных в ч. 1 ст. 10 Закона о персональных данных, допускается, если соблюдаются запреты и условия, предусмотренные ст. 10.1 Закона о персональных данных.\r\n");
    			br48 = element("br");
    			t59 = text("5.8. Согласие Пользователя на обработку персональных данных, разрешенных для распространения, оформляется отдельно от других согласий на обработку его персональных данных. При этом соблюдаются условия, предусмотренные, в частности, ст. 10.1 Закона о персональных данных. Требования к содержанию такого согласия устанавливаются уполномоченным органом по защите прав субъектов персональных данных.\r\n");
    			br49 = element("br");
    			t60 = text("5.8.1 Согласие на обработку персональных данных, разрешенных для распространения, Пользователь предоставляет Оператору непосредственно.\r\n");
    			br50 = element("br");
    			t61 = text("5.8.2 Оператор обязан в срок не позднее трех рабочих дней с момента получения указанного согласия Пользователя опубликовать информацию об условиях обработки, о наличии запретов и условий на обработку неограниченным кругом лиц персональных данных, разрешенных для распространения.\r\n");
    			br51 = element("br");
    			t62 = text("5.8.3 Передача (распространение, предоставление, доступ) персональных данных, разрешенных субъектом персональных данных для распространения, должна быть прекращена в любое время по требованию субъекта персональных данных. Данное требование должно включать в себя фамилию, имя, отчество (при наличии), контактную информацию (номер телефона, адрес электронной почты или почтовый адрес) субъекта персональных данных, а также перечень персональных данных, обработка которых подлежит прекращению. Указанные в данном требовании персональные данные могут обрабатываться только Оператором, которому оно направлено.\r\n");
    			br52 = element("br");
    			t63 = text("5.8.4 Согласие на обработку персональных данных, разрешенных для распространения, прекращает свое действие с момента поступления Оператору требования, указанного в п. 5.8.3 настоящей Политики в отношении обработки персональных данных.");
    			t64 = space();
    			p5 = element("p");
    			t65 = text("6. Принципы обработки персональных данных\r\n");
    			br53 = element("br");
    			t66 = text("6.1. Обработка персональных данных осуществляется на законной и справедливой основе.\r\n");
    			br54 = element("br");
    			t67 = text("6.2. Обработка персональных данных ограничивается достижением конкретных, заранее определенных и законных целей. Не допускается обработка персональных данных, несовместимая с целями сбора персональных данных.\r\n");
    			br55 = element("br");
    			t68 = text("6.3. Не допускается объединение баз данных, содержащих персональные данные, обработка которых осуществляется в целях, несовместимых между собой.\r\n");
    			br56 = element("br");
    			t69 = text("6.4. Обработке подлежат только персональные данные, которые отвечают целям их обработки.\r\n");
    			br57 = element("br");
    			t70 = text("6.5. Содержание и объем обрабатываемых персональных данных соответствуют заявленным целям обработки. Не допускается избыточность обрабатываемых персональных данных по отношению к заявленным целям их обработки.\r\n");
    			br58 = element("br");
    			t71 = text("6.6. При обработке персональных данных обеспечивается точность персональных данных, их достаточность, а в необходимых случаях и актуальность по отношению к целям обработки персональных данных. Оператор принимает необходимые меры и/или обеспечивает их принятие по удалению или уточнению неполных или неточных данных.\r\n");
    			br59 = element("br");
    			t72 = text("6.7. Хранение персональных данных осуществляется в форме, позволяющей определить субъекта персональных данных, не дольше, чем этого требуют цели обработки персональных данных, если срок хранения персональных данных не установлен федеральным законом, договором, стороной которого, выгодоприобретателем или поручителем по которому является субъект персональных данных. Обрабатываемые персональные данные уничтожаются либо обезличиваются по достижении целей обработки или в случае утраты необходимости в достижении этих целей, если иное не предусмотрено федеральным законом.");
    			t73 = space();
    			p6 = element("p");
    			t74 = text("7. Цели обработки персональных данных\r\n");
    			br60 = element("br");
    			t75 = text("7.1. Цель обработки персональных данных Пользователя:\r\n");
    			br61 = element("br");
    			t76 = text("– информирование Пользователя посредством отправки электронных писем;\r\n");
    			br62 = element("br");
    			t77 = text("– предоставление доступа Пользователю к сервисам, информации и/или материалам, содержащимся на веб-сайте https://site.ru.\r\n");
    			br63 = element("br");
    			t78 = text("7.2. Также Оператор имеет право направлять Пользователю уведомления о новых продуктах и услугах, специальных предложениях и различных событиях. Пользователь всегда может отказаться от получения информационных сообщений, направив Оператору письмо на адрес электронной почты email@site.ru с пометкой «Отказ от уведомлений о новых продуктах и услугах и специальных предложениях».\r\n");
    			br64 = element("br");
    			t79 = text("7.3. Обезличенные данные Пользователей, собираемые с помощью сервисов интернет-статистики, служат для сбора информации о действиях Пользователей на сайте, улучшения качества сайта и его содержания.");
    			t80 = space();
    			p7 = element("p");
    			t81 = text("8. Правовые основания обработки персональных данных\r\n");
    			br65 = element("br");
    			t82 = text("8.1. Правовыми основаниями обработки персональных данных Оператором являются:\r\n");
    			br66 = element("br");
    			t83 = text("– Федеральный закон \"Об информации, информационных технологиях и о защите информации\" от 27.07.2006 N 149-ФЗ;\r\n");
    			br67 = element("br");
    			t84 = text("– федеральные законы, иные нормативно-правовые акты в сфере защиты персональных данных;\r\n");
    			br68 = element("br");
    			t85 = text("– согласия Пользователей на обработку их персональных данных, на обработку персональных данных, разрешенных для распространения.\r\n");
    			br69 = element("br");
    			t86 = text("8.2. Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы, расположенные на сайте https://site.ru или направленные Оператору посредством электронной почты. Заполняя соответствующие формы и/или отправляя свои персональные данные Оператору, Пользователь выражает свое согласие с данной Политикой.\r\n");
    			br70 = element("br");
    			t87 = text("8.3. Оператор обрабатывает обезличенные данные о Пользователе в случае, если это разрешено в настройках браузера Пользователя (включено сохранение файлов «cookie» и использование технологии JavaScript).\r\n");
    			br71 = element("br");
    			t88 = text("8.4. Субъект персональных данных самостоятельно принимает решение о предоставлении его персональных данных и дает согласие свободно, своей волей и в своем интересе.");
    			t89 = space();
    			p8 = element("p");
    			t90 = text("9. Условия обработки персональных данных\r\n");
    			br72 = element("br");
    			t91 = text("9.1. Обработка персональных данных осуществляется с согласия субъекта персональных данных на обработку его персональных данных.\r\n");
    			br73 = element("br");
    			t92 = text("9.2. Обработка персональных данных необходима для достижения целей, предусмотренных международным договором Российской Федерации или законом, для осуществления возложенных законодательством Российской Федерации на оператора функций, полномочий и обязанностей.\r\n");
    			br74 = element("br");
    			t93 = text("9.3. Обработка персональных данных необходима для осуществления правосудия, исполнения судебного акта, акта другого органа или должностного лица, подлежащих исполнению в соответствии с законодательством Российской Федерации об исполнительном производстве.\r\n");
    			br75 = element("br");
    			t94 = text("9.4. Обработка персональных данных необходима для исполнения договора, стороной которого либо выгодоприобретателем или поручителем по которому является субъект персональных данных, а также для заключения договора по инициативе субъекта персональных данных или договора, по которому субъект персональных данных будет являться выгодоприобретателем или поручителем.\r\n");
    			br76 = element("br");
    			t95 = text("9.5. Обработка персональных данных необходима для осуществления прав и законных интересов оператора или третьих лиц либо для достижения общественно значимых целей при условии, что при этом не нарушаются права и свободы субъекта персональных данных.\r\n");
    			br77 = element("br");
    			t96 = text("9.6. Осуществляется обработка персональных данных, доступ неограниченного круга лиц к которым предоставлен субъектом персональных данных либо по его просьбе (далее – общедоступные персональные данные).\r\n");
    			br78 = element("br");
    			t97 = text("9.7. Осуществляется обработка персональных данных, подлежащих опубликованию или обязательному раскрытию в соответствии с федеральным законом.");
    			t98 = space();
    			p9 = element("p");
    			t99 = text("10. Порядок сбора, хранения, передачи и других видов обработки персональных данных\r\n");
    			br79 = element("br");
    			t100 = text("Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных.\r\n");
    			br80 = element("br");
    			t101 = text("10.1. Оператор обеспечивает сохранность персональных данных и принимает все возможные меры, исключающие доступ к персональным данным неуполномоченных лиц.\r\n");
    			br81 = element("br");
    			t102 = text("10.2. Персональные данные Пользователя никогда, ни при каких условиях не будут переданы третьим лицам, за исключением случаев, связанных с исполнением действующего законодательства либо в случае, если субъектом персональных данных дано согласие Оператору на передачу данных третьему лицу для исполнения обязательств по гражданско-правовому договору.\r\n");
    			br82 = element("br");
    			t103 = text("10.3. В случае выявления неточностей в персональных данных, Пользователь может актуализировать их самостоятельно, путем направления Оператору уведомление на адрес электронной почты Оператора email@site.ru с пометкой «Актуализация персональных данных».\r\n");
    			br83 = element("br");
    			t104 = text("10.4. Срок обработки персональных данных определяется достижением целей, для которых были собраны персональные данные, если иной срок не предусмотрен договором или действующим законодательством.\r\n");
    			br84 = element("br");
    			t105 = text("Пользователь может в любой момент отозвать свое согласие на обработку персональных данных, направив Оператору уведомление посредством электронной почты на электронный адрес Оператора email@site.ru с пометкой «Отзыв согласия на обработку персональных данных».\r\n");
    			br85 = element("br");
    			t106 = text("10.5. Вся информация, которая собирается сторонними сервисами, в том числе платежными системами, средствами связи и другими поставщиками услуг, хранится и обрабатывается указанными лицами (Операторами) в соответствии с их Пользовательским соглашением и Политикой конфиденциальности. Субъект персональных данных и/или Пользователь обязан самостоятельно своевременно ознакомиться с указанными документами. Оператор не несет ответственность за действия третьих лиц, в том числе указанных в настоящем пункте поставщиков услуг.\r\n");
    			br86 = element("br");
    			t107 = text("10.6. Установленные субъектом персональных данных запреты на передачу (кроме предоставления доступа), а также на обработку или условия обработки (кроме получения доступа) персональных данных, разрешенных для распространения, не действуют в случаях обработки персональных данных в государственных, общественных и иных публичных интересах, определенных законодательством РФ.\r\n");
    			br87 = element("br");
    			t108 = text("10.7. Оператор при обработке персональных данных обеспечивает конфиденциальность персональных данных.\r\n");
    			br88 = element("br");
    			t109 = text("10.8. Оператор осуществляет хранение персональных данных в форме, позволяющей определить субъекта персональных данных, не дольше, чем этого требуют цели обработки персональных данных, если срок хранения персональных данных не установлен федеральным законом, договором, стороной которого, выгодоприобретателем или поручителем по которому является субъект персональных данных.\r\n");
    			br89 = element("br");
    			t110 = text("10.9. Условием прекращения обработки персональных данных может являться достижение целей обработки персональных данных, истечение срока действия согласия субъекта персональных данных или отзыв согласия субъектом персональных данных, а также выявление неправомерной обработки персональных данных.");
    			t111 = space();
    			p10 = element("p");
    			t112 = text("11. Перечень действий, производимых Оператором с полученными персональными данными\r\n");
    			br90 = element("br");
    			t113 = text("11.1. Оператор осуществляет сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление и уничтожение персональных данных.\r\n");
    			br91 = element("br");
    			t114 = text("11.2. Оператор осуществляет автоматизированную обработку персональных данных с получением и/или передачей полученной информации по информационно-телекоммуникационным сетям или без таковой.");
    			t115 = space();
    			p11 = element("p");
    			t116 = text("12. Трансграничная передача персональных данных\r\n");
    			br92 = element("br");
    			t117 = text("12.1. Оператор до начала осуществления трансграничной передачи персональных данных обязан убедиться в том, что иностранным государством, на территорию которого предполагается осуществлять передачу персональных данных, обеспечивается надежная защита прав субъектов персональных данных.\r\n");
    			br93 = element("br");
    			t118 = text("12.2. Трансграничная передача персональных данных на территории иностранных государств, не отвечающих вышеуказанным требованиям, может осуществляться только в случае наличия согласия в письменной форме субъекта персональных данных на трансграничную передачу его персональных данных и/или исполнения договора, стороной которого является субъект персональных данных.");
    			t119 = space();
    			p12 = element("p");
    			t120 = text("13. Конфиденциальность персональных данных\r\n");
    			br94 = element("br");
    			t121 = text("Оператор и иные лица, получившие доступ к персональным данным, обязаны не раскрывать третьим лицам и не распространять персональные данные без согласия субъекта персональных данных, если иное не предусмотрено федеральным законом.");
    			t122 = space();
    			p13 = element("p");
    			t123 = text("14. Заключительные положения\r\n");
    			br95 = element("br");
    			t124 = text("14.1. Пользователь может получить любые разъяснения по интересующим вопросам, касающимся обработки его персональных данных, обратившись к Оператору с помощью электронной почты email@site.ru.\r\n");
    			br96 = element("br");
    			t125 = text("14.2. В данном документе будут отражены любые изменения политики обработки персональных данных Оператором. Политика действует бессрочно до замены ее новой версией.\r\n");
    			br97 = element("br");
    			t126 = text("14.3. Актуальная версия Политики в свободном доступе расположена в сети Интернет по адресу https://site.ru.");
    			attr_dev(h2, "class", "svelte-b1ieyo");
    			add_location(h2, file$c, 14, 4, 180);
    			add_location(br0, file$c, 18, 0, 226);
    			add_location(br1, file$c, 19, 0, 587);
    			add_location(br2, file$c, 20, 0, 851);
    			attr_dev(p0, "class", "svelte-b1ieyo");
    			add_location(p0, file$c, 16, 0, 201);
    			add_location(br3, file$c, 24, 0, 1113);
    			add_location(br4, file$c, 25, 0, 1246);
    			add_location(br5, file$c, 26, 0, 1430);
    			add_location(br6, file$c, 27, 0, 1626);
    			add_location(br7, file$c, 28, 0, 1822);
    			add_location(br8, file$c, 29, 0, 2065);
    			add_location(br9, file$c, 30, 0, 2529);
    			add_location(br10, file$c, 31, 0, 2905);
    			add_location(br11, file$c, 32, 0, 3060);
    			add_location(br12, file$c, 33, 0, 3500);
    			add_location(br13, file$c, 34, 0, 3570);
    			add_location(br14, file$c, 35, 0, 3722);
    			add_location(br15, file$c, 36, 0, 4169);
    			add_location(br16, file$c, 37, 0, 4395);
    			attr_dev(p1, "class", "svelte-b1ieyo");
    			add_location(p1, file$c, 22, 0, 1062);
    			add_location(br17, file$c, 41, 0, 4761);
    			add_location(br18, file$c, 42, 0, 4793);
    			add_location(br19, file$c, 43, 0, 4913);
    			add_location(br20, file$c, 44, 0, 5172);
    			add_location(br21, file$c, 45, 0, 5497);
    			add_location(br22, file$c, 46, 0, 5524);
    			add_location(br23, file$c, 47, 0, 5647);
    			add_location(br24, file$c, 48, 0, 5758);
    			add_location(br25, file$c, 49, 0, 5916);
    			add_location(br26, file$c, 50, 0, 6098);
    			add_location(br27, file$c, 51, 0, 6233);
    			add_location(br28, file$c, 52, 0, 6550);
    			add_location(br29, file$c, 53, 0, 6762);
    			attr_dev(p2, "class", "svelte-b1ieyo");
    			add_location(p2, file$c, 39, 0, 4713);
    			add_location(br30, file$c, 57, 0, 6918);
    			add_location(br31, file$c, 58, 0, 6970);
    			add_location(br32, file$c, 59, 0, 7477);
    			add_location(br33, file$c, 60, 0, 7804);
    			add_location(br34, file$c, 61, 0, 7942);
    			add_location(br35, file$c, 62, 0, 8001);
    			add_location(br36, file$c, 63, 0, 8198);
    			add_location(br37, file$c, 64, 0, 8271);
    			add_location(br38, file$c, 65, 0, 8319);
    			add_location(br39, file$c, 66, 0, 8377);
    			add_location(br40, file$c, 67, 0, 8467);
    			attr_dev(p3, "class", "svelte-b1ieyo");
    			add_location(p3, file$c, 55, 0, 6850);
    			add_location(br41, file$c, 71, 0, 8759);
    			add_location(br42, file$c, 72, 0, 8793);
    			add_location(br43, file$c, 73, 0, 8822);
    			add_location(br44, file$c, 74, 0, 8850);
    			add_location(br45, file$c, 75, 0, 9045);
    			add_location(br46, file$c, 76, 0, 9152);
    			add_location(br47, file$c, 77, 0, 9372);
    			add_location(br48, file$c, 78, 0, 9656);
    			add_location(br49, file$c, 79, 0, 10057);
    			add_location(br50, file$c, 80, 0, 10198);
    			add_location(br51, file$c, 81, 0, 10483);
    			add_location(br52, file$c, 82, 0, 11095);
    			attr_dev(p4, "class", "svelte-b1ieyo");
    			add_location(p4, file$c, 69, 0, 8679);
    			add_location(br53, file$c, 86, 0, 11389);
    			add_location(br54, file$c, 87, 0, 11479);
    			add_location(br55, file$c, 88, 0, 11693);
    			add_location(br56, file$c, 89, 0, 11843);
    			add_location(br57, file$c, 90, 0, 11937);
    			add_location(br58, file$c, 91, 0, 12152);
    			add_location(br59, file$c, 92, 0, 12473);
    			attr_dev(p5, "class", "svelte-b1ieyo");
    			add_location(p5, file$c, 84, 0, 11341);
    			add_location(br60, file$c, 96, 0, 13100);
    			add_location(br61, file$c, 97, 0, 13159);
    			add_location(br62, file$c, 98, 0, 13234);
    			add_location(br63, file$c, 99, 0, 13361);
    			add_location(br64, file$c, 100, 0, 13743);
    			attr_dev(p6, "class", "svelte-b1ieyo");
    			add_location(p6, file$c, 94, 0, 13056);
    			add_location(br65, file$c, 104, 0, 14010);
    			add_location(br66, file$c, 105, 0, 14093);
    			add_location(br67, file$c, 106, 0, 14208);
    			add_location(br68, file$c, 107, 0, 14301);
    			add_location(br69, file$c, 108, 0, 14435);
    			add_location(br70, file$c, 109, 0, 14835);
    			add_location(br71, file$c, 110, 0, 15043);
    			attr_dev(p7, "class", "svelte-b1ieyo");
    			add_location(p7, file$c, 102, 0, 13952);
    			add_location(br72, file$c, 114, 0, 15266);
    			add_location(br73, file$c, 115, 0, 15399);
    			add_location(br74, file$c, 116, 0, 15664);
    			add_location(br75, file$c, 117, 0, 15925);
    			add_location(br76, file$c, 118, 0, 16293);
    			add_location(br77, file$c, 119, 0, 16547);
    			add_location(br78, file$c, 120, 0, 16754);
    			attr_dev(p8, "class", "svelte-b1ieyo");
    			add_location(p8, file$c, 112, 0, 15219);
    			add_location(br79, file$c, 124, 0, 16996);
    			add_location(br80, file$c, 125, 0, 17269);
    			add_location(br81, file$c, 126, 0, 17429);
    			add_location(br82, file$c, 127, 0, 17784);
    			add_location(br83, file$c, 128, 0, 18041);
    			add_location(br84, file$c, 129, 0, 18241);
    			add_location(br85, file$c, 130, 0, 18505);
    			add_location(br86, file$c, 131, 0, 19033);
    			add_location(br87, file$c, 132, 0, 19411);
    			add_location(br88, file$c, 133, 0, 19518);
    			add_location(br89, file$c, 134, 0, 19898);
    			attr_dev(p9, "class", "svelte-b1ieyo");
    			add_location(p9, file$c, 122, 0, 16907);
    			add_location(br90, file$c, 138, 0, 20294);
    			add_location(br91, file$c, 139, 0, 20566);
    			attr_dev(p10, "class", "svelte-b1ieyo");
    			add_location(p10, file$c, 136, 0, 20205);
    			add_location(br92, file$c, 143, 0, 20820);
    			add_location(br93, file$c, 144, 0, 21110);
    			attr_dev(p11, "class", "svelte-b1ieyo");
    			add_location(p11, file$c, 141, 0, 20766);
    			add_location(br94, file$c, 148, 0, 21535);
    			attr_dev(p12, "class", "svelte-b1ieyo");
    			add_location(p12, file$c, 146, 0, 21486);
    			add_location(br95, file$c, 152, 0, 21811);
    			add_location(br96, file$c, 153, 0, 22007);
    			add_location(br97, file$c, 154, 0, 22176);
    			attr_dev(p13, "class", "svelte-b1ieyo");
    			add_location(p13, file$c, 150, 0, 21776);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t2);
    			append_dev(p0, br0);
    			append_dev(p0, t3);
    			append_dev(p0, br1);
    			append_dev(p0, t4);
    			append_dev(p0, br2);
    			append_dev(p0, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t7);
    			append_dev(p1, br3);
    			append_dev(p1, t8);
    			append_dev(p1, br4);
    			append_dev(p1, t9);
    			append_dev(p1, br5);
    			append_dev(p1, t10);
    			append_dev(p1, br6);
    			append_dev(p1, t11);
    			append_dev(p1, br7);
    			append_dev(p1, t12);
    			append_dev(p1, br8);
    			append_dev(p1, t13);
    			append_dev(p1, br9);
    			append_dev(p1, t14);
    			append_dev(p1, br10);
    			append_dev(p1, t15);
    			append_dev(p1, br11);
    			append_dev(p1, t16);
    			append_dev(p1, br12);
    			append_dev(p1, t17);
    			append_dev(p1, br13);
    			append_dev(p1, t18);
    			append_dev(p1, br14);
    			append_dev(p1, t19);
    			append_dev(p1, br15);
    			append_dev(p1, t20);
    			append_dev(p1, br16);
    			append_dev(p1, t21);
    			insert_dev(target, t22, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t23);
    			append_dev(p2, br17);
    			append_dev(p2, t24);
    			append_dev(p2, br18);
    			append_dev(p2, t25);
    			append_dev(p2, br19);
    			append_dev(p2, t26);
    			append_dev(p2, br20);
    			append_dev(p2, t27);
    			append_dev(p2, br21);
    			append_dev(p2, t28);
    			append_dev(p2, br22);
    			append_dev(p2, t29);
    			append_dev(p2, br23);
    			append_dev(p2, t30);
    			append_dev(p2, br24);
    			append_dev(p2, t31);
    			append_dev(p2, br25);
    			append_dev(p2, t32);
    			append_dev(p2, br26);
    			append_dev(p2, t33);
    			append_dev(p2, br27);
    			append_dev(p2, t34);
    			append_dev(p2, br28);
    			append_dev(p2, t35);
    			append_dev(p2, br29);
    			append_dev(p2, t36);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t38);
    			append_dev(p3, br30);
    			append_dev(p3, t39);
    			append_dev(p3, br31);
    			append_dev(p3, t40);
    			append_dev(p3, br32);
    			append_dev(p3, t41);
    			append_dev(p3, br33);
    			append_dev(p3, t42);
    			append_dev(p3, br34);
    			append_dev(p3, t43);
    			append_dev(p3, br35);
    			append_dev(p3, t44);
    			append_dev(p3, br36);
    			append_dev(p3, t45);
    			append_dev(p3, br37);
    			append_dev(p3, t46);
    			append_dev(p3, br38);
    			append_dev(p3, t47);
    			append_dev(p3, br39);
    			append_dev(p3, t48);
    			append_dev(p3, br40);
    			append_dev(p3, t49);
    			insert_dev(target, t50, anchor);
    			insert_dev(target, p4, anchor);
    			append_dev(p4, t51);
    			append_dev(p4, br41);
    			append_dev(p4, t52);
    			append_dev(p4, br42);
    			append_dev(p4, t53);
    			append_dev(p4, br43);
    			append_dev(p4, t54);
    			append_dev(p4, br44);
    			append_dev(p4, t55);
    			append_dev(p4, br45);
    			append_dev(p4, t56);
    			append_dev(p4, br46);
    			append_dev(p4, t57);
    			append_dev(p4, br47);
    			append_dev(p4, t58);
    			append_dev(p4, br48);
    			append_dev(p4, t59);
    			append_dev(p4, br49);
    			append_dev(p4, t60);
    			append_dev(p4, br50);
    			append_dev(p4, t61);
    			append_dev(p4, br51);
    			append_dev(p4, t62);
    			append_dev(p4, br52);
    			append_dev(p4, t63);
    			insert_dev(target, t64, anchor);
    			insert_dev(target, p5, anchor);
    			append_dev(p5, t65);
    			append_dev(p5, br53);
    			append_dev(p5, t66);
    			append_dev(p5, br54);
    			append_dev(p5, t67);
    			append_dev(p5, br55);
    			append_dev(p5, t68);
    			append_dev(p5, br56);
    			append_dev(p5, t69);
    			append_dev(p5, br57);
    			append_dev(p5, t70);
    			append_dev(p5, br58);
    			append_dev(p5, t71);
    			append_dev(p5, br59);
    			append_dev(p5, t72);
    			insert_dev(target, t73, anchor);
    			insert_dev(target, p6, anchor);
    			append_dev(p6, t74);
    			append_dev(p6, br60);
    			append_dev(p6, t75);
    			append_dev(p6, br61);
    			append_dev(p6, t76);
    			append_dev(p6, br62);
    			append_dev(p6, t77);
    			append_dev(p6, br63);
    			append_dev(p6, t78);
    			append_dev(p6, br64);
    			append_dev(p6, t79);
    			insert_dev(target, t80, anchor);
    			insert_dev(target, p7, anchor);
    			append_dev(p7, t81);
    			append_dev(p7, br65);
    			append_dev(p7, t82);
    			append_dev(p7, br66);
    			append_dev(p7, t83);
    			append_dev(p7, br67);
    			append_dev(p7, t84);
    			append_dev(p7, br68);
    			append_dev(p7, t85);
    			append_dev(p7, br69);
    			append_dev(p7, t86);
    			append_dev(p7, br70);
    			append_dev(p7, t87);
    			append_dev(p7, br71);
    			append_dev(p7, t88);
    			insert_dev(target, t89, anchor);
    			insert_dev(target, p8, anchor);
    			append_dev(p8, t90);
    			append_dev(p8, br72);
    			append_dev(p8, t91);
    			append_dev(p8, br73);
    			append_dev(p8, t92);
    			append_dev(p8, br74);
    			append_dev(p8, t93);
    			append_dev(p8, br75);
    			append_dev(p8, t94);
    			append_dev(p8, br76);
    			append_dev(p8, t95);
    			append_dev(p8, br77);
    			append_dev(p8, t96);
    			append_dev(p8, br78);
    			append_dev(p8, t97);
    			insert_dev(target, t98, anchor);
    			insert_dev(target, p9, anchor);
    			append_dev(p9, t99);
    			append_dev(p9, br79);
    			append_dev(p9, t100);
    			append_dev(p9, br80);
    			append_dev(p9, t101);
    			append_dev(p9, br81);
    			append_dev(p9, t102);
    			append_dev(p9, br82);
    			append_dev(p9, t103);
    			append_dev(p9, br83);
    			append_dev(p9, t104);
    			append_dev(p9, br84);
    			append_dev(p9, t105);
    			append_dev(p9, br85);
    			append_dev(p9, t106);
    			append_dev(p9, br86);
    			append_dev(p9, t107);
    			append_dev(p9, br87);
    			append_dev(p9, t108);
    			append_dev(p9, br88);
    			append_dev(p9, t109);
    			append_dev(p9, br89);
    			append_dev(p9, t110);
    			insert_dev(target, t111, anchor);
    			insert_dev(target, p10, anchor);
    			append_dev(p10, t112);
    			append_dev(p10, br90);
    			append_dev(p10, t113);
    			append_dev(p10, br91);
    			append_dev(p10, t114);
    			insert_dev(target, t115, anchor);
    			insert_dev(target, p11, anchor);
    			append_dev(p11, t116);
    			append_dev(p11, br92);
    			append_dev(p11, t117);
    			append_dev(p11, br93);
    			append_dev(p11, t118);
    			insert_dev(target, t119, anchor);
    			insert_dev(target, p12, anchor);
    			append_dev(p12, t120);
    			append_dev(p12, br94);
    			append_dev(p12, t121);
    			insert_dev(target, t122, anchor);
    			insert_dev(target, p13, anchor);
    			append_dev(p13, t123);
    			append_dev(p13, br95);
    			append_dev(p13, t124);
    			append_dev(p13, br96);
    			append_dev(p13, t125);
    			append_dev(p13, br97);
    			append_dev(p13, t126);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t22);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t50);
    			if (detaching) detach_dev(p4);
    			if (detaching) detach_dev(t64);
    			if (detaching) detach_dev(p5);
    			if (detaching) detach_dev(t73);
    			if (detaching) detach_dev(p6);
    			if (detaching) detach_dev(t80);
    			if (detaching) detach_dev(p7);
    			if (detaching) detach_dev(t89);
    			if (detaching) detach_dev(p8);
    			if (detaching) detach_dev(t98);
    			if (detaching) detach_dev(p9);
    			if (detaching) detach_dev(t111);
    			if (detaching) detach_dev(p10);
    			if (detaching) detach_dev(t115);
    			if (detaching) detach_dev(p11);
    			if (detaching) detach_dev(t119);
    			if (detaching) detach_dev(p12);
    			if (detaching) detach_dev(t122);
    			if (detaching) detach_dev(p13);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PrivacyModal', slots, []);
    	let { title } = $$props;
    	const writable_props = ['title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PrivacyModal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ title });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title];
    }

    class PrivacyModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PrivacyModal",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<PrivacyModal> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<PrivacyModal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<PrivacyModal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\UI\ModalView.svelte generated by Svelte v3.42.4 */
    const file$b = "src\\UI\\ModalView.svelte";

    function create_fragment$b(ctx) {
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Нажимая кнопку «Жду расчёт», Вы соглашаетесь на обработку персональных данных и с политикой конфиденциальности";
    			attr_dev(p, "class", "svelte-1tjapbq");
    			add_location(p, file$b, 21, 3, 435);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (!mounted) {
    				dispose = listen_dev(p, "click", /*showPrivacyModal*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModalView', slots, []);
    	const { open } = getContext('simple-modal');

    	const showPrivacyModal = () => {
    		open(PrivacyModal, {
    			title: "Политика в отношении обработки персональных данных"
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ModalView> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		PrivacyModal,
    		open,
    		showPrivacyModal
    	});

    	return [showPrivacyModal];
    }

    class ModalView extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModalView",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* node_modules\svelte-simple-modal\src\Modal.svelte generated by Svelte v3.42.4 */

    const { Object: Object_1, window: window_1 } = globals;
    const file$a = "node_modules\\svelte-simple-modal\\src\\Modal.svelte";

    // (338:0) {#if Component}
    function create_if_block(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let switch_instance;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*state*/ ctx[0].closeButton && create_if_block_1(ctx);
    	var switch_value = /*Component*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div0, "class", "content svelte-2wx9ab");
    			attr_dev(div0, "style", /*cssContent*/ ctx[8]);
    			add_location(div0, file$a, 366, 8, 8864);
    			attr_dev(div1, "class", "window svelte-2wx9ab");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[7]);
    			add_location(div1, file$a, 347, 6, 8239);
    			attr_dev(div2, "class", "window-wrap svelte-2wx9ab");
    			attr_dev(div2, "style", /*cssWindowWrap*/ ctx[6]);
    			add_location(div2, file$a, 346, 4, 8168);
    			attr_dev(div3, "class", "bg svelte-2wx9ab");
    			attr_dev(div3, "style", /*cssBg*/ ctx[5]);
    			add_location(div3, file$a, 338, 2, 7958);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			if (switch_instance) {
    				mount_component(switch_instance, div0, null);
    			}

    			/*div1_binding*/ ctx[39](div1);
    			/*div2_binding*/ ctx[40](div2);
    			/*div3_binding*/ ctx[41](div3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div1,
    						"introstart",
    						function () {
    							if (is_function(/*onOpen*/ ctx[12])) /*onOpen*/ ctx[12].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outrostart",
    						function () {
    							if (is_function(/*onClose*/ ctx[13])) /*onClose*/ ctx[13].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"introend",
    						function () {
    							if (is_function(/*onOpened*/ ctx[14])) /*onOpened*/ ctx[14].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div1,
    						"outroend",
    						function () {
    							if (is_function(/*onClosed*/ ctx[15])) /*onClosed*/ ctx[15].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(div3, "mousedown", /*handleOuterMousedown*/ ctx[19], false, false, false),
    					listen_dev(div3, "mouseup", /*handleOuterMouseup*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*state*/ ctx[0].closeButton) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*state*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (switch_value !== (switch_value = /*Component*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div0, null);
    				} else {
    					switch_instance = null;
    				}
    			}

    			if (!current || dirty[0] & /*cssContent*/ 256) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[8]);
    			}

    			if (!current || dirty[0] & /*cssWindow*/ 128) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[7]);
    			}

    			if (!current || dirty[0] & /*cssWindowWrap*/ 64) {
    				attr_dev(div2, "style", /*cssWindowWrap*/ ctx[6]);
    			}

    			if (!current || dirty[0] & /*cssBg*/ 32) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[11], /*state*/ ctx[0].transitionWindowProps, true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[10], /*state*/ ctx[0].transitionBgProps, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*currentTransitionWindow*/ ctx[11], /*state*/ ctx[0].transitionWindowProps, false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*currentTransitionBg*/ ctx[10], /*state*/ ctx[0].transitionBgProps, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			if (switch_instance) destroy_component(switch_instance);
    			/*div1_binding*/ ctx[39](null);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[40](null);
    			/*div3_binding*/ ctx[41](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(338:0) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (360:8) {#if state.closeButton}
    function create_if_block_1(ctx) {
    	let show_if;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*state*/ 1) show_if = !!/*isFunction*/ ctx[16](/*state*/ ctx[0].closeButton);
    		if (show_if) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx, [-1, -1]);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx, dirty);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(360:8) {#if state.closeButton}",
    		ctx
    	});

    	return block;
    }

    // (363:10) {:else}
    function create_else_block(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "close svelte-2wx9ab");
    			attr_dev(button, "style", /*cssCloseButton*/ ctx[9]);
    			add_location(button, file$a, 363, 12, 8761);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[17], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*cssCloseButton*/ 512) {
    				attr_dev(button, "style", /*cssCloseButton*/ ctx[9]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(363:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (361:10) {#if isFunction(state.closeButton)}
    function create_if_block_2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	var switch_value = /*state*/ ctx[0].closeButton;

    	function switch_props(ctx) {
    		return {
    			props: { onClose: /*close*/ ctx[17] },
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (switch_value !== (switch_value = /*state*/ ctx[0].closeButton)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(361:10) {#if isFunction(state.closeButton)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[1] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[38].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[37], null);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "keydown", /*handleKeydown*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*Component*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*Component*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t.parentNode, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[1] & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[37],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[37])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[37], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function bind(Component, props = {}) {
    	return function ModalComponent(options) {
    		return new Component({
    				...options,
    				props: { ...props, ...options.props }
    			});
    	};
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	const baseSetContext = setContext;
    	let { show = null } = $$props;
    	let { key = 'simple-modal' } = $$props;
    	let { closeButton = true } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { styleBg = {} } = $$props;
    	let { styleWindowWrap = {} } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { styleCloseButton = {} } = $$props;
    	let { setContext: setContext$1 = baseSetContext } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;

    	const defaultState = {
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps
    	};

    	let state = { ...defaultState };
    	let Component = null;
    	let background;
    	let wrap;
    	let modalWindow;
    	let scrollY;
    	let cssBg;
    	let cssWindowWrap;
    	let cssWindow;
    	let cssContent;
    	let cssCloseButton;
    	let currentTransitionBg;
    	let currentTransitionWindow;
    	let prevBodyPosition;
    	let prevBodyOverflow;
    	let prevBodyWidth;
    	let outerClickTarget;
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

    	const toCssString = props => props
    	? Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, '')
    	: '';

    	const isFunction = f => !!(f && f.constructor && f.call && f.apply);

    	const updateStyleTransition = () => {
    		$$invalidate(5, cssBg = toCssString(Object.assign(
    			{},
    			{
    				width: window.innerWidth,
    				height: window.innerHeight
    			},
    			state.styleBg
    		)));

    		$$invalidate(6, cssWindowWrap = toCssString(state.styleWindowWrap));
    		$$invalidate(7, cssWindow = toCssString(state.styleWindow));
    		$$invalidate(8, cssContent = toCssString(state.styleContent));
    		$$invalidate(9, cssCloseButton = toCssString(state.styleCloseButton));
    		$$invalidate(10, currentTransitionBg = state.transitionBg);
    		$$invalidate(11, currentTransitionWindow = state.transitionWindow);
    	};

    	const toVoid = () => {
    		
    	};

    	let onOpen = toVoid;
    	let onClose = toVoid;
    	let onOpened = toVoid;
    	let onClosed = toVoid;

    	const open = (NewComponent, newProps = {}, options = {}, callback = {}) => {
    		$$invalidate(1, Component = bind(NewComponent, newProps));
    		$$invalidate(0, state = { ...defaultState, ...options });
    		updateStyleTransition();
    		disableScroll();

    		($$invalidate(12, onOpen = event => {
    			if (callback.onOpen) callback.onOpen(event);
    			dispatch('open');
    			dispatch('opening'); // Deprecated. Do not use!
    		}), $$invalidate(13, onClose = event => {
    			if (callback.onClose) callback.onClose(event);
    			dispatch('close');
    			dispatch('closing'); // Deprecated. Do not use!
    		}), $$invalidate(14, onOpened = event => {
    			if (callback.onOpened) callback.onOpened(event);
    			dispatch('opened');
    		}));

    		$$invalidate(15, onClosed = event => {
    			if (callback.onClosed) callback.onClosed(event);
    			dispatch('closed');
    		});
    	};

    	const close = (callback = {}) => {
    		$$invalidate(13, onClose = callback.onClose || onClose);
    		$$invalidate(15, onClosed = callback.onClosed || onClosed);
    		$$invalidate(1, Component = null);
    		enableScroll();
    	};

    	const handleKeydown = event => {
    		if (state.closeOnEsc && Component && event.key === 'Escape') {
    			event.preventDefault();
    			close();
    		}

    		if (Component && event.key === 'Tab') {
    			// trap focus
    			const nodes = modalWindow.querySelectorAll('*');

    			const tabbable = Array.from(nodes).filter(node => node.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && event.shiftKey) index = 0;
    			index += tabbable.length + (event.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			event.preventDefault();
    		}
    	};

    	const handleOuterMousedown = event => {
    		if (state.closeOnOuterClick && (event.target === background || event.target === wrap)) outerClickTarget = event.target;
    	};

    	const handleOuterMouseup = event => {
    		if (state.closeOnOuterClick && event.target === outerClickTarget) {
    			event.preventDefault();
    			close();
    		}
    	};

    	const disableScroll = () => {
    		scrollY = window.scrollY;
    		prevBodyPosition = document.body.style.position;
    		prevBodyOverflow = document.body.style.overflow;
    		prevBodyWidth = document.body.style.width;
    		document.body.style.position = 'fixed';
    		document.body.style.top = `-${scrollY}px`;
    		document.body.style.overflow = 'hidden';
    		document.body.style.width = '100%';
    	};

    	const enableScroll = () => {
    		document.body.style.position = prevBodyPosition || '';
    		document.body.style.top = '';
    		document.body.style.overflow = prevBodyOverflow || '';
    		document.body.style.width = prevBodyWidth || '';
    		window.scrollTo(0, scrollY);
    	};

    	setContext$1(key, { open, close });
    	let isMounted = false;

    	onDestroy(() => {
    		if (isMounted) close();
    	});

    	onMount(() => {
    		$$invalidate(36, isMounted = true);
    	});

    	const writable_props = [
    		'show',
    		'key',
    		'closeButton',
    		'closeOnEsc',
    		'closeOnOuterClick',
    		'styleBg',
    		'styleWindowWrap',
    		'styleWindow',
    		'styleContent',
    		'styleCloseButton',
    		'setContext',
    		'transitionBg',
    		'transitionBgProps',
    		'transitionWindow',
    		'transitionWindowProps'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			modalWindow = $$value;
    			$$invalidate(4, modalWindow);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			wrap = $$value;
    			$$invalidate(3, wrap);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			background = $$value;
    			$$invalidate(2, background);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('show' in $$props) $$invalidate(21, show = $$props.show);
    		if ('key' in $$props) $$invalidate(22, key = $$props.key);
    		if ('closeButton' in $$props) $$invalidate(23, closeButton = $$props.closeButton);
    		if ('closeOnEsc' in $$props) $$invalidate(24, closeOnEsc = $$props.closeOnEsc);
    		if ('closeOnOuterClick' in $$props) $$invalidate(25, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ('styleBg' in $$props) $$invalidate(26, styleBg = $$props.styleBg);
    		if ('styleWindowWrap' in $$props) $$invalidate(27, styleWindowWrap = $$props.styleWindowWrap);
    		if ('styleWindow' in $$props) $$invalidate(28, styleWindow = $$props.styleWindow);
    		if ('styleContent' in $$props) $$invalidate(29, styleContent = $$props.styleContent);
    		if ('styleCloseButton' in $$props) $$invalidate(30, styleCloseButton = $$props.styleCloseButton);
    		if ('setContext' in $$props) $$invalidate(31, setContext$1 = $$props.setContext);
    		if ('transitionBg' in $$props) $$invalidate(32, transitionBg = $$props.transitionBg);
    		if ('transitionBgProps' in $$props) $$invalidate(33, transitionBgProps = $$props.transitionBgProps);
    		if ('transitionWindow' in $$props) $$invalidate(34, transitionWindow = $$props.transitionWindow);
    		if ('transitionWindowProps' in $$props) $$invalidate(35, transitionWindowProps = $$props.transitionWindowProps);
    		if ('$$scope' in $$props) $$invalidate(37, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		bind,
    		svelte,
    		fade,
    		createEventDispatcher,
    		dispatch,
    		baseSetContext,
    		show,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		setContext: setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		defaultState,
    		state,
    		Component,
    		background,
    		wrap,
    		modalWindow,
    		scrollY,
    		cssBg,
    		cssWindowWrap,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow,
    		prevBodyPosition,
    		prevBodyOverflow,
    		prevBodyWidth,
    		outerClickTarget,
    		camelCaseToDash,
    		toCssString,
    		isFunction,
    		updateStyleTransition,
    		toVoid,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		open,
    		close,
    		handleKeydown,
    		handleOuterMousedown,
    		handleOuterMouseup,
    		disableScroll,
    		enableScroll,
    		isMounted
    	});

    	$$self.$inject_state = $$props => {
    		if ('show' in $$props) $$invalidate(21, show = $$props.show);
    		if ('key' in $$props) $$invalidate(22, key = $$props.key);
    		if ('closeButton' in $$props) $$invalidate(23, closeButton = $$props.closeButton);
    		if ('closeOnEsc' in $$props) $$invalidate(24, closeOnEsc = $$props.closeOnEsc);
    		if ('closeOnOuterClick' in $$props) $$invalidate(25, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ('styleBg' in $$props) $$invalidate(26, styleBg = $$props.styleBg);
    		if ('styleWindowWrap' in $$props) $$invalidate(27, styleWindowWrap = $$props.styleWindowWrap);
    		if ('styleWindow' in $$props) $$invalidate(28, styleWindow = $$props.styleWindow);
    		if ('styleContent' in $$props) $$invalidate(29, styleContent = $$props.styleContent);
    		if ('styleCloseButton' in $$props) $$invalidate(30, styleCloseButton = $$props.styleCloseButton);
    		if ('setContext' in $$props) $$invalidate(31, setContext$1 = $$props.setContext);
    		if ('transitionBg' in $$props) $$invalidate(32, transitionBg = $$props.transitionBg);
    		if ('transitionBgProps' in $$props) $$invalidate(33, transitionBgProps = $$props.transitionBgProps);
    		if ('transitionWindow' in $$props) $$invalidate(34, transitionWindow = $$props.transitionWindow);
    		if ('transitionWindowProps' in $$props) $$invalidate(35, transitionWindowProps = $$props.transitionWindowProps);
    		if ('state' in $$props) $$invalidate(0, state = $$props.state);
    		if ('Component' in $$props) $$invalidate(1, Component = $$props.Component);
    		if ('background' in $$props) $$invalidate(2, background = $$props.background);
    		if ('wrap' in $$props) $$invalidate(3, wrap = $$props.wrap);
    		if ('modalWindow' in $$props) $$invalidate(4, modalWindow = $$props.modalWindow);
    		if ('scrollY' in $$props) scrollY = $$props.scrollY;
    		if ('cssBg' in $$props) $$invalidate(5, cssBg = $$props.cssBg);
    		if ('cssWindowWrap' in $$props) $$invalidate(6, cssWindowWrap = $$props.cssWindowWrap);
    		if ('cssWindow' in $$props) $$invalidate(7, cssWindow = $$props.cssWindow);
    		if ('cssContent' in $$props) $$invalidate(8, cssContent = $$props.cssContent);
    		if ('cssCloseButton' in $$props) $$invalidate(9, cssCloseButton = $$props.cssCloseButton);
    		if ('currentTransitionBg' in $$props) $$invalidate(10, currentTransitionBg = $$props.currentTransitionBg);
    		if ('currentTransitionWindow' in $$props) $$invalidate(11, currentTransitionWindow = $$props.currentTransitionWindow);
    		if ('prevBodyPosition' in $$props) prevBodyPosition = $$props.prevBodyPosition;
    		if ('prevBodyOverflow' in $$props) prevBodyOverflow = $$props.prevBodyOverflow;
    		if ('prevBodyWidth' in $$props) prevBodyWidth = $$props.prevBodyWidth;
    		if ('outerClickTarget' in $$props) outerClickTarget = $$props.outerClickTarget;
    		if ('onOpen' in $$props) $$invalidate(12, onOpen = $$props.onOpen);
    		if ('onClose' in $$props) $$invalidate(13, onClose = $$props.onClose);
    		if ('onOpened' in $$props) $$invalidate(14, onOpened = $$props.onOpened);
    		if ('onClosed' in $$props) $$invalidate(15, onClosed = $$props.onClosed);
    		if ('isMounted' in $$props) $$invalidate(36, isMounted = $$props.isMounted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*show*/ 2097152 | $$self.$$.dirty[1] & /*isMounted*/ 32) {
    			{
    				if (isMounted) {
    					if (isFunction(show)) {
    						open(show);
    					} else {
    						close();
    					}
    				}
    			}
    		}
    	};

    	return [
    		state,
    		Component,
    		background,
    		wrap,
    		modalWindow,
    		cssBg,
    		cssWindowWrap,
    		cssWindow,
    		cssContent,
    		cssCloseButton,
    		currentTransitionBg,
    		currentTransitionWindow,
    		onOpen,
    		onClose,
    		onOpened,
    		onClosed,
    		isFunction,
    		close,
    		handleKeydown,
    		handleOuterMousedown,
    		handleOuterMouseup,
    		show,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindowWrap,
    		styleWindow,
    		styleContent,
    		styleCloseButton,
    		setContext$1,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		isMounted,
    		$$scope,
    		slots,
    		div1_binding,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$a,
    			create_fragment$a,
    			safe_not_equal,
    			{
    				show: 21,
    				key: 22,
    				closeButton: 23,
    				closeOnEsc: 24,
    				closeOnOuterClick: 25,
    				styleBg: 26,
    				styleWindowWrap: 27,
    				styleWindow: 28,
    				styleContent: 29,
    				styleCloseButton: 30,
    				setContext: 31,
    				transitionBg: 32,
    				transitionBgProps: 33,
    				transitionWindow: 34,
    				transitionWindowProps: 35
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get show() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set show(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get key() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnEsc() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnEsc(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnOuterClick() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnOuterClick(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindowWrap() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindowWrap(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleCloseButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleCloseButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContext() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setContext(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBgProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBgProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindowProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindowProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Block\Promo.svelte generated by Svelte v3.42.4 */
    const file$9 = "src\\Block\\Promo.svelte";

    // (196:9) <Modal>
    function create_default_slot(ctx) {
    	let modalview;
    	let current;
    	modalview = new ModalView({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(modalview.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modalview, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modalview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modalview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modalview, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(196:9) <Modal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let section;
    	let div0;
    	let h1;
    	let t0;
    	let br;
    	let t1;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let div1;
    	let h2;
    	let t5;
    	let form;
    	let input0;
    	let t6;
    	let input1;
    	let t7;
    	let input2;
    	let t8;
    	let input3;
    	let t9;
    	let button;
    	let t10;
    	let modal;
    	let current;
    	let mounted;
    	let dispose;

    	input0 = new Input({
    			props: {
    				id: "name",
    				name: "name",
    				placeholder: "Ваше имя",
    				type: "text"
    			},
    			$$inline: true
    		});

    	input1 = new Input({
    			props: {
    				id: "phone",
    				name: "phone",
    				placeholder: "+7 (000) 000-00-00",
    				type: "tel"
    			},
    			$$inline: true
    		});

    	input2 = new Input({
    			props: {
    				id: "email",
    				name: "email",
    				placeholder: "Email *",
    				type: "email",
    				required: "true"
    			},
    			$$inline: true
    		});

    	input3 = new Input({
    			props: {
    				id: "description",
    				name: "description",
    				placeholder: "Комментарий",
    				controlType: "textarea",
    				rows: "2"
    			},
    			$$inline: true
    		});

    	button = new Button({
    			props: { type: "submit", caption: "📧 Жду расчет" },
    			$$inline: true
    		});

    	button.$on("click", submitForm);

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("Морские контейнерные перевозки ");
    			br = element("br");
    			t1 = text("из Китая и Кореи");
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			div1 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Запрос коммерческого предложения";
    			t5 = space();
    			form = element("form");
    			create_component(input0.$$.fragment);
    			t6 = space();
    			create_component(input1.$$.fragment);
    			t7 = space();
    			create_component(input2.$$.fragment);
    			t8 = space();
    			create_component(input3.$$.fragment);
    			t9 = space();
    			create_component(button.$$.fragment);
    			t10 = space();
    			create_component(modal.$$.fragment);
    			add_location(br, file$9, 159, 43, 3000);
    			attr_dev(h1, "class", "svelte-1nt8wgj");
    			add_location(h1, file$9, 159, 8, 2965);
    			if (!src_url_equal(img.src, img_src_value = "assets/product2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "cargo");
    			attr_dev(img, "class", "svelte-1nt8wgj");
    			add_location(img, file$9, 160, 8, 3035);
    			attr_dev(div0, "class", "title svelte-1nt8wgj");
    			add_location(div0, file$9, 158, 4, 2936);
    			attr_dev(h2, "class", "svelte-1nt8wgj");
    			add_location(h2, file$9, 163, 8, 3124);
    			attr_dev(form, "id", "order");
    			attr_dev(form, "class", "svelte-1nt8wgj");
    			add_location(form, file$9, 165, 3, 3172);
    			attr_dev(div1, "class", "form svelte-1nt8wgj");
    			add_location(div1, file$9, 162, 4, 3096);
    			attr_dev(section, "id", "promo");
    			attr_dev(section, "class", "svelte-1nt8wgj");
    			add_location(section, file$9, 157, 0, 2910);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(h1, br);
    			append_dev(h1, t1);
    			append_dev(div0, t2);
    			append_dev(div0, img);
    			append_dev(section, t3);
    			append_dev(section, div1);
    			append_dev(div1, h2);
    			append_dev(div1, t5);
    			append_dev(div1, form);
    			mount_component(input0, form, null);
    			append_dev(form, t6);
    			mount_component(input1, form, null);
    			append_dev(form, t7);
    			mount_component(input2, form, null);
    			append_dev(form, t8);
    			mount_component(input3, form, null);
    			append_dev(form, t9);
    			mount_component(button, form, null);
    			append_dev(form, t10);
    			mount_component(modal, form, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(form, "submit", prevent_default(submitForm), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(input0.$$.fragment, local);
    			transition_in(input1.$$.fragment, local);
    			transition_in(input2.$$.fragment, local);
    			transition_in(input3.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(input0.$$.fragment, local);
    			transition_out(input1.$$.fragment, local);
    			transition_out(input2.$$.fragment, local);
    			transition_out(input3.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(input0);
    			destroy_component(input1);
    			destroy_component(input2);
    			destroy_component(input3);
    			destroy_component(button);
    			destroy_component(modal);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function submitForm() {
    	function sendData() {
    		const XHR = new XMLHttpRequest();
    		const FD = new FormData(order);
    		XHR.open("POST", "http://altenic.beget.tech/sea/mailer/smart.php");
    		XHR.send(FD);
    	}

    	const order = document.getElementById("order");

    	order.addEventListener("submit", function (event) {
    		event.preventDefault();
    		sendData();
    		alert('Ваш запрос отправлен в отдел логистики!');
    		event.target.reset();
    	});
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Promo', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Promo> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Button,
    		Input,
    		ModalView,
    		Modal,
    		submitForm
    	});

    	return [];
    }

    class Promo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Promo",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const services = writable([
      {
        id: '1',
        title: '🚢 Морские <br>грузоперевозки',
        price: '',
        description: '- Из любого порта Китая <br>- Развёрнутый расчёт расходов'
      },
      {
        id: '2',
        title: '💴 Оплата <br>на производство',
        price: '',
        description: '- В различной валюте (¥, $)<br>- Только для юридических лиц'
      },
      {
        id: '3',
        title: '☑️ Таможенное <br>оформление',
        price: '',
        description: '- 100% официально <br>- Подбор кода ТНВЭД <br>- Оптимизация платежей'
      },
      {
        id: '4',
        title: '📃 Пакет <br>документов',
        price: '',
        description: '- Договор с российской компанией <br>- УПД с НДС, ГТД'
      }
    ]);

    /* src\Block\ServiceItem.svelte generated by Svelte v3.42.4 */

    const file$8 = "src\\Block\\ServiceItem.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let div0;
    	let h2;
    	let t0;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = space();
    			p0 = element("p");
    			t1 = space();
    			p1 = element("p");
    			attr_dev(h2, "class", "svelte-tz9o6v");
    			add_location(h2, file$8, 62, 7, 1192);
    			attr_dev(p0, "class", "svelte-tz9o6v");
    			add_location(p0, file$8, 63, 7, 1223);
    			attr_dev(p1, "class", "svelte-tz9o6v");
    			add_location(p1, file$8, 64, 7, 1252);
    			add_location(div0, file$8, 61, 4, 1178);
    			attr_dev(div1, "class", "service svelte-tz9o6v");
    			add_location(div1, file$8, 60, 0, 1151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h2);
    			h2.innerHTML = /*title*/ ctx[0];
    			append_dev(div0, t0);
    			append_dev(div0, p0);
    			p0.innerHTML = /*price*/ ctx[1];
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			p1.innerHTML = /*description*/ ctx[2];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) h2.innerHTML = /*title*/ ctx[0];			if (dirty & /*price*/ 2) p0.innerHTML = /*price*/ ctx[1];			if (dirty & /*description*/ 4) p1.innerHTML = /*description*/ ctx[2];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ServiceItem', slots, []);
    	let { id } = $$props;
    	let { title } = $$props;
    	let { price } = $$props;
    	let { description } = $$props;
    	const writable_props = ['id', 'title', 'price', 'description'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ServiceItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('price' in $$props) $$invalidate(1, price = $$props.price);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({ id, title, price, description });

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(3, id = $$props.id);
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('price' in $$props) $$invalidate(1, price = $$props.price);
    		if ('description' in $$props) $$invalidate(2, description = $$props.description);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, price, description, id];
    }

    class ServiceItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			id: 3,
    			title: 0,
    			price: 1,
    			description: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ServiceItem",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[3] === undefined && !('id' in props)) {
    			console.warn("<ServiceItem> was created without expected prop 'id'");
    		}

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<ServiceItem> was created without expected prop 'title'");
    		}

    		if (/*price*/ ctx[1] === undefined && !('price' in props)) {
    			console.warn("<ServiceItem> was created without expected prop 'price'");
    		}

    		if (/*description*/ ctx[2] === undefined && !('description' in props)) {
    			console.warn("<ServiceItem> was created without expected prop 'description'");
    		}
    	}

    	get id() {
    		throw new Error("<ServiceItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ServiceItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<ServiceItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ServiceItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get price() {
    		throw new Error("<ServiceItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set price(value) {
    		throw new Error("<ServiceItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<ServiceItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<ServiceItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Block\Service.svelte generated by Svelte v3.42.4 */
    const file$7 = "src\\Block\\Service.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (47:2) {#each $services as service (service.id)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let serviceitem;
    	let current;

    	serviceitem = new ServiceItem({
    			props: {
    				id: /*service*/ ctx[1].id,
    				title: /*service*/ ctx[1].title,
    				price: /*service*/ ctx[1].price,
    				description: /*service*/ ctx[1].description
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(serviceitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(serviceitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const serviceitem_changes = {};
    			if (dirty & /*$services*/ 1) serviceitem_changes.id = /*service*/ ctx[1].id;
    			if (dirty & /*$services*/ 1) serviceitem_changes.title = /*service*/ ctx[1].title;
    			if (dirty & /*$services*/ 1) serviceitem_changes.price = /*service*/ ctx[1].price;
    			if (dirty & /*$services*/ 1) serviceitem_changes.description = /*service*/ ctx[1].description;
    			serviceitem.$set(serviceitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(serviceitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(serviceitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(serviceitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(47:2) {#each $services as service (service.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let section;
    	let h2;
    	let span;
    	let t1;
    	let t2;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$services*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*service*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			span = element("span");
    			span.textContent = "✔️";
    			t1 = text("  Выкупим • Оформим • Доставим!");
    			t2 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "svelte-7bqdcl");
    			add_location(span, file$7, 43, 5, 701);
    			attr_dev(h2, "class", "svelte-7bqdcl");
    			add_location(h2, file$7, 43, 1, 697);
    			attr_dev(div, "class", "svelte-7bqdcl");
    			add_location(div, file$7, 45, 1, 761);
    			attr_dev(section, "id", "service");
    			attr_dev(section, "class", "svelte-7bqdcl");
    			add_location(section, file$7, 42, 0, 672);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(h2, span);
    			append_dev(h2, t1);
    			append_dev(section, t2);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$services*/ 1) {
    				each_value = /*$services*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $services;
    	validate_store(services, 'services');
    	component_subscribe($$self, services, $$value => $$invalidate(0, $services = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Service', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Service> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ services, ServiceItem, $services });
    	return [$services];
    }

    class Service extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Service",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\Block\Features.svelte generated by Svelte v3.42.4 */

    const file$6 = "src\\Block\\Features.svelte";

    function create_fragment$6(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let div9;
    	let div0;
    	let t3;
    	let div1;
    	let t5;
    	let div2;
    	let t7;
    	let div3;
    	let t9;
    	let div4;
    	let t11;
    	let div5;
    	let t13;
    	let div6;
    	let t15;
    	let div7;
    	let t17;
    	let div8;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Наши преимущества 🌟";
    			t1 = space();
    			div9 = element("div");
    			div0 = element("div");
    			div0.textContent = "Предоставляем полностью \"белые\" документы\r\n        с НДС и ГТД, пройдем любую встречную проверку.";
    			t3 = space();
    			div1 = element("div");
    			div1.textContent = "Подбираем оптимальный код ТНВЭД, соответсвующий категории вашего товара.";
    			t5 = space();
    			div2 = element("div");
    			div2.textContent = "Возможность таможенного представительства вашего контракта (работа по прямому контракту клиента, ВТТ).";
    			t7 = space();
    			div3 = element("div");
    			div3.textContent = "Предоставление личного менеджера.";
    			t9 = space();
    			div4 = element("div");
    			div4.textContent = "Прозрачность тарифов: распишем все пошлины и налоги по коду ТНВЭД.";
    			t11 = space();
    			div5 = element("div");
    			div5.textContent = "Перечисление денег поставщикам с предоставлением SWIFT.";
    			t13 = space();
    			div6 = element("div");
    			div6.textContent = "Помощь в оформлении сертификатов. Наличие своих сертификатов.";
    			t15 = space();
    			div7 = element("div");
    			div7.textContent = "Возможность присутвия нашего представителя при досмотре груза в порту Владивостока.";
    			t17 = space();
    			div8 = element("div");
    			div8.textContent = "Возможность сотрудничества с федеральными организациями.";
    			attr_dev(h2, "class", "svelte-1yuonz3");
    			add_location(h2, file$6, 91, 4, 1598);
    			attr_dev(div0, "class", "svelte-1yuonz3");
    			add_location(div0, file$6, 94, 8, 1673);
    			attr_dev(div1, "class", "svelte-1yuonz3");
    			add_location(div1, file$6, 96, 8, 1791);
    			attr_dev(div2, "class", "svelte-1yuonz3");
    			add_location(div2, file$6, 97, 8, 1884);
    			attr_dev(div3, "class", "svelte-1yuonz3");
    			add_location(div3, file$6, 98, 8, 2015);
    			attr_dev(div4, "class", "svelte-1yuonz3");
    			add_location(div4, file$6, 99, 8, 2069);
    			attr_dev(div5, "class", "svelte-1yuonz3");
    			add_location(div5, file$6, 100, 8, 2156);
    			attr_dev(div6, "class", "svelte-1yuonz3");
    			add_location(div6, file$6, 101, 8, 2232);
    			attr_dev(div7, "class", "svelte-1yuonz3");
    			add_location(div7, file$6, 102, 8, 2314);
    			attr_dev(div8, "class", "svelte-1yuonz3");
    			add_location(div8, file$6, 103, 8, 2418);
    			attr_dev(div9, "class", "plus svelte-1yuonz3");
    			add_location(div9, file$6, 93, 4, 1645);
    			attr_dev(section, "id", "features");
    			attr_dev(section, "class", "svelte-1yuonz3");
    			add_location(section, file$6, 90, 0, 1569);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t1);
    			append_dev(section, div9);
    			append_dev(div9, div0);
    			append_dev(div9, t3);
    			append_dev(div9, div1);
    			append_dev(div9, t5);
    			append_dev(div9, div2);
    			append_dev(div9, t7);
    			append_dev(div9, div3);
    			append_dev(div9, t9);
    			append_dev(div9, div4);
    			append_dev(div9, t11);
    			append_dev(div9, div5);
    			append_dev(div9, t13);
    			append_dev(div9, div6);
    			append_dev(div9, t15);
    			append_dev(div9, div7);
    			append_dev(div9, t17);
    			append_dev(div9, div8);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Features', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Features> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Features extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Features",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\Block\About.svelte generated by Svelte v3.42.4 */

    const file$5 = "src\\Block\\About.svelte";

    function create_fragment$5(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let div3;
    	let div0;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let div1;
    	let p2;
    	let span;
    	let t7;
    	let ul;
    	let li0;
    	let t9;
    	let li1;
    	let t11;
    	let li2;
    	let t13;
    	let li3;
    	let t15;
    	let li4;
    	let t17;
    	let li5;
    	let t19;
    	let li6;
    	let t21;
    	let li7;
    	let t23;
    	let li8;
    	let t25;
    	let li9;
    	let t27;
    	let div2;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Комплексный подход к грузоперевозке 🚢";
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Доставка контейнеров из Китая \r\n                в Россию, а так же доставка из Кореи – одни из основных направлений деятельности нашей компании. Если вам требуется доставить груз из Китая или Кореи, или вы хотите узнать стоимость контейнера из Китая – обратитесь к нам. Наши специалисты в кратчайшие сроки предоставят расчёт, подберут оптимальный маршрут, обеспечив надёжную доставку груза.";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Основные направления доставки груза из Китая и Кореи: Владивосток, Волгоград, Воронеж, Екатеринбург, Казань, Кемерово, Краснодар, Красноярск, Липецк, Москва, Нижний Новгород, Новосибирск, Омск, Оренбург, Пенза, Пермь, Ростов, Самара, Санкт-Петербург, Саратов, Тверь, Томск, Ульяновск, Уфа, Чебоксары, Челябинск, Ярославль.";
    			t5 = space();
    			div1 = element("div");
    			p2 = element("p");
    			span = element("span");
    			span.textContent = "Осуществляем перевозку различных видов грузов:";
    			t7 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "камеры видеонаблюдения, видеорегистраторы";
    			t9 = space();
    			li1 = element("li");
    			li1.textContent = "кабельная продукция (кабели коаксиальные, витая пара и т.д.)";
    			t11 = space();
    			li2 = element("li");
    			li2.textContent = "оборудование различного назначения";
    			t13 = space();
    			li3 = element("li");
    			li3.textContent = "светодиодная продукция (LED, люстры, светильники, прожекторы, промышленное освещение, панели и т.д.";
    			t15 = space();
    			li4 = element("li");
    			li4.textContent = "светодиодные экраны";
    			t17 = space();
    			li5 = element("li");
    			li5.textContent = "товары народного потребления (хоз. инвентарь)";
    			t19 = space();
    			li6 = element("li");
    			li6.textContent = "сельхоз запчасти";
    			t21 = space();
    			li7 = element("li");
    			li7.textContent = "ткани";
    			t23 = space();
    			li8 = element("li");
    			li8.textContent = "офисная мебель";
    			t25 = space();
    			li9 = element("li");
    			li9.textContent = "детские товары и игрушки";
    			t27 = space();
    			div2 = element("div");
    			attr_dev(h2, "class", "svelte-1rikga9");
    			add_location(h2, file$5, 90, 4, 1479);
    			add_location(p0, file$5, 94, 12, 1590);
    			add_location(p1, file$5, 97, 12, 2015);
    			attr_dev(div0, "class", "svelte-1rikga9");
    			add_location(div0, file$5, 93, 8, 1571);
    			attr_dev(span, "class", "svelte-1rikga9");
    			add_location(span, file$5, 102, 15, 2403);
    			add_location(p2, file$5, 102, 12, 2400);
    			attr_dev(li0, "class", "svelte-1rikga9");
    			add_location(li0, file$5, 104, 16, 2516);
    			attr_dev(li1, "class", "svelte-1rikga9");
    			add_location(li1, file$5, 105, 16, 2584);
    			attr_dev(li2, "class", "svelte-1rikga9");
    			add_location(li2, file$5, 106, 16, 2681);
    			attr_dev(li3, "class", "svelte-1rikga9");
    			add_location(li3, file$5, 107, 16, 2752);
    			attr_dev(li4, "class", "svelte-1rikga9");
    			add_location(li4, file$5, 108, 16, 2878);
    			attr_dev(li5, "class", "svelte-1rikga9");
    			add_location(li5, file$5, 109, 16, 2924);
    			attr_dev(li6, "class", "svelte-1rikga9");
    			add_location(li6, file$5, 110, 16, 2996);
    			attr_dev(li7, "class", "svelte-1rikga9");
    			add_location(li7, file$5, 111, 16, 3039);
    			attr_dev(li8, "class", "svelte-1rikga9");
    			add_location(li8, file$5, 112, 16, 3071);
    			attr_dev(li9, "class", "svelte-1rikga9");
    			add_location(li9, file$5, 113, 16, 3112);
    			attr_dev(ul, "class", "items svelte-1rikga9");
    			add_location(ul, file$5, 103, 12, 2480);
    			attr_dev(div1, "class", "svelte-1rikga9");
    			add_location(div1, file$5, 101, 8, 2381);
    			attr_dev(div2, "class", "svelte-1rikga9");
    			add_location(div2, file$5, 116, 4, 3188);
    			attr_dev(div3, "class", "freight-items svelte-1rikga9");
    			add_location(div3, file$5, 92, 4, 1534);
    			attr_dev(section, "id", "freight");
    			attr_dev(section, "class", "svelte-1rikga9");
    			add_location(section, file$5, 89, 0, 1451);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t1);
    			append_dev(section, div3);
    			append_dev(div3, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div3, t5);
    			append_dev(div3, div1);
    			append_dev(div1, p2);
    			append_dev(p2, span);
    			append_dev(div1, t7);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t9);
    			append_dev(ul, li1);
    			append_dev(ul, t11);
    			append_dev(ul, li2);
    			append_dev(ul, t13);
    			append_dev(ul, li3);
    			append_dev(ul, t15);
    			append_dev(ul, li4);
    			append_dev(ul, t17);
    			append_dev(ul, li5);
    			append_dev(ul, t19);
    			append_dev(ul, li6);
    			append_dev(ul, t21);
    			append_dev(ul, li7);
    			append_dev(ul, t23);
    			append_dev(ul, li8);
    			append_dev(ul, t25);
    			append_dev(ul, li9);
    			append_dev(div3, t27);
    			append_dev(div3, div2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const steps = writable([
      {
        id: '1',
        title: '✉️ Оставьте заявку'
      },
      {
        id: '2',
        title: '📞 Наш звонок'
      },
      {
        id: '3',
        title: '📃 Заключаем договор'
      },
      {
        id: '4',
        title: '📦 Забираем груз'
      },
      {
        id: '5',
        title: '☑️ Экспорт'
      },
      {
        id: '6',
        title: '✅ Доставка клиенту'
      }
    ]);

    /* src\Block\StepsItem.svelte generated by Svelte v3.42.4 */

    const file$4 = "src\\Block\\StepsItem.svelte";

    function create_fragment$4(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let h2;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*id*/ ctx[0]);
    			t1 = space();
    			h2 = element("h2");
    			attr_dev(span, "class", "svelte-8ycuyr");
    			add_location(span, file$4, 69, 25, 1383);
    			attr_dev(div0, "class", "num svelte-8ycuyr");
    			add_location(div0, file$4, 69, 8, 1366);
    			attr_dev(h2, "class", "svelte-8ycuyr");
    			add_location(h2, file$4, 70, 8, 1416);
    			add_location(div1, file$4, 68, 5, 1351);
    			attr_dev(div2, "class", "step svelte-8ycuyr");
    			add_location(div2, file$4, 67, 1, 1326);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div1, t1);
    			append_dev(div1, h2);
    			h2.innerHTML = /*title*/ ctx[1];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 1) set_data_dev(t0, /*id*/ ctx[0]);
    			if (dirty & /*title*/ 2) h2.innerHTML = /*title*/ ctx[1];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StepsItem', slots, []);
    	let { id } = $$props;
    	let { title } = $$props;
    	const writable_props = ['id', 'title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StepsItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({ id, title });

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('title' in $$props) $$invalidate(1, title = $$props.title);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [id, title];
    }

    class StepsItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { id: 0, title: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StepsItem",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[0] === undefined && !('id' in props)) {
    			console.warn("<StepsItem> was created without expected prop 'id'");
    		}

    		if (/*title*/ ctx[1] === undefined && !('title' in props)) {
    			console.warn("<StepsItem> was created without expected prop 'title'");
    		}
    	}

    	get id() {
    		throw new Error("<StepsItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<StepsItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<StepsItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<StepsItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Block\Steps.svelte generated by Svelte v3.42.4 */
    const file$3 = "src\\Block\\Steps.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (43:8) {#each $steps as step (step.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let stepsitem;
    	let current;

    	stepsitem = new StepsItem({
    			props: {
    				id: /*step*/ ctx[1].id,
    				title: /*step*/ ctx[1].title
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(stepsitem.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(stepsitem, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const stepsitem_changes = {};
    			if (dirty & /*$steps*/ 1) stepsitem_changes.id = /*step*/ ctx[1].id;
    			if (dirty & /*$steps*/ 1) stepsitem_changes.title = /*step*/ ctx[1].title;
    			stepsitem.$set(stepsitem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stepsitem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stepsitem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(stepsitem, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(43:8) {#each $steps as step (step.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*$steps*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*step*/ ctx[1].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Наша схема работы 💬";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h2, "class", "svelte-h0ly1k");
    			add_location(h2, file$3, 38, 4, 692);
    			attr_dev(div, "class", "steps-items svelte-h0ly1k");
    			add_location(div, file$3, 41, 4, 743);
    			attr_dev(section, "id", "steps");
    			attr_dev(section, "class", "svelte-h0ly1k");
    			add_location(section, file$3, 37, 0, 666);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t1);
    			append_dev(section, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$steps*/ 1) {
    				each_value = /*$steps*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $steps;
    	validate_store(steps, 'steps');
    	component_subscribe($$self, steps, $$value => $$invalidate(0, $steps = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Steps', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Steps> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ steps, StepsItem, $steps });
    	return [$steps];
    }

    class Steps extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Steps",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\Block\Partners.svelte generated by Svelte v3.42.4 */

    const file$2 = "src\\Block\\Partners.svelte";

    function create_fragment$2(ctx) {
    	let section;
    	let h2;
    	let t1;
    	let div5;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div2;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let div3;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let div4;
    	let img4;
    	let img4_src_value;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h2 = element("h2");
    			h2.textContent = "Наши партнеры 🤝";
    			t1 = space();
    			div5 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t2 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t3 = space();
    			div2 = element("div");
    			img2 = element("img");
    			t4 = space();
    			div3 = element("div");
    			img3 = element("img");
    			t5 = space();
    			div4 = element("div");
    			img4 = element("img");
    			attr_dev(h2, "class", "svelte-1olns0t");
    			add_location(h2, file$2, 49, 4, 732);
    			if (!src_url_equal(img0.src, img0_src_value = "assets/partners/maersk_logo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-1olns0t");
    			add_location(img0, file$2, 51, 13, 797);
    			add_location(div0, file$2, 51, 8, 792);
    			if (!src_url_equal(img1.src, img1_src_value = "assets/partners/fesco_logo.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-1olns0t");
    			add_location(img1, file$2, 52, 13, 869);
    			add_location(div1, file$2, 52, 8, 864);
    			if (!src_url_equal(img2.src, img2_src_value = "assets/partners/cosco_logo.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "");
    			attr_dev(img2, "class", "svelte-1olns0t");
    			add_location(img2, file$2, 53, 13, 940);
    			add_location(div2, file$2, 53, 8, 935);
    			if (!src_url_equal(img3.src, img3_src_value = "assets/partners/baykal-servis-logo.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "");
    			attr_dev(img3, "class", "svelte-1olns0t");
    			add_location(img3, file$2, 54, 13, 1010);
    			add_location(div3, file$2, 54, 8, 1005);
    			if (!src_url_equal(img4.src, img4_src_value = "assets/partners/dl_logo.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "");
    			attr_dev(img4, "class", "svelte-1olns0t");
    			add_location(img4, file$2, 55, 13, 1088);
    			add_location(div4, file$2, 55, 8, 1083);
    			attr_dev(div5, "class", "items svelte-1olns0t");
    			add_location(div5, file$2, 50, 4, 763);
    			attr_dev(section, "id", "partners");
    			attr_dev(section, "class", "svelte-1olns0t");
    			add_location(section, file$2, 48, 0, 703);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h2);
    			append_dev(section, t1);
    			append_dev(section, div5);
    			append_dev(div5, div0);
    			append_dev(div0, img0);
    			append_dev(div5, t2);
    			append_dev(div5, div1);
    			append_dev(div1, img1);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div2, img2);
    			append_dev(div5, t4);
    			append_dev(div5, div3);
    			append_dev(div3, img3);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, img4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Partners', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Partners> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Partners extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Partners",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\Block\Footer.svelte generated by Svelte v3.42.4 */
    const file$1 = "src\\Block\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let script;
    	let script_src_value;
    	let t0;
    	let div;
    	let p0;
    	let button0;
    	let t1;
    	let p1;
    	let button1;
    	let t2;
    	let p2;
    	let a0;
    	let t4;
    	let p3;
    	let a1;
    	let t6;
    	let a2;
    	let img;
    	let img_src_value;
    	let current;

    	button0 = new Button({
    			props: {
    				href: "mailto:" + /*email*/ ctx[0],
    				caption: /*email*/ ctx[0]
    			},
    			$$inline: true
    		});

    	button1 = new Button({
    			props: {
    				href: "tel:" + /*phone*/ ctx[1],
    				caption: /*phone*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			script = element("script");
    			t0 = space();
    			div = element("div");
    			p0 = element("p");
    			create_component(button0.$$.fragment);
    			t1 = space();
    			p1 = element("p");
    			create_component(button1.$$.fragment);
    			t2 = space();
    			p2 = element("p");
    			a0 = element("a");
    			a0.textContent = "💬 Написать в WhatsApp";
    			t4 = space();
    			p3 = element("p");
    			a1 = element("a");
    			a1.textContent = "💬 Написать в WeChat";
    			t6 = space();
    			a2 = element("a");
    			img = element("img");
    			attr_dev(script, "charset", "utf-8");
    			script.async = true;
    			if (!src_url_equal(script.src, script_src_value = "https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A99789942423a09eabbb2af9377537ef8b96d6629c54857df6cf766bc75be481b&width=100%25&height=400&lang=ru_RU&scroll=true")) attr_dev(script, "src", script_src_value);
    			add_location(script, file$1, 52, 4, 976);
    			add_location(p0, file$1, 55, 8, 1261);
    			add_location(p1, file$1, 58, 8, 1352);
    			attr_dev(a0, "href", "whatsapp://send?phone=79831702322");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-1sie2ng");
    			add_location(a0, file$1, 61, 11, 1443);
    			add_location(p2, file$1, 61, 8, 1440);
    			attr_dev(a1, "href", "weixin://dl/chat?wxid_mlik0ewa38aq22");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-1sie2ng");
    			add_location(a1, file$1, 62, 11, 1545);
    			add_location(p3, file$1, 62, 8, 1542);
    			if (!src_url_equal(img.src, img_src_value = "assets/wechat.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "wechat");
    			add_location(img, file$1, 63, 95, 1732);
    			attr_dev(a2, "href", "https://msng.link/o/?https%3A%2F%2Fu.wechat.com%2FkJ_N-dev-hnWmU8SbmxyWCA=wc");
    			attr_dev(a2, "class", "svelte-1sie2ng");
    			add_location(a2, file$1, 63, 8, 1645);
    			attr_dev(div, "class", "contact svelte-1sie2ng");
    			add_location(div, file$1, 54, 4, 1230);
    			attr_dev(footer, "class", "svelte-1sie2ng");
    			add_location(footer, file$1, 51, 0, 962);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, script);
    			append_dev(footer, t0);
    			append_dev(footer, div);
    			append_dev(div, p0);
    			mount_component(button0, p0, null);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			mount_component(button1, p1, null);
    			append_dev(div, t2);
    			append_dev(div, p2);
    			append_dev(p2, a0);
    			append_dev(div, t4);
    			append_dev(div, p3);
    			append_dev(p3, a1);
    			append_dev(div, t6);
    			append_dev(div, a2);
    			append_dev(a2, img);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const button0_changes = {};
    			if (dirty & /*email*/ 1) button0_changes.href = "mailto:" + /*email*/ ctx[0];
    			if (dirty & /*email*/ 1) button0_changes.caption = /*email*/ ctx[0];
    			button0.$set(button0_changes);
    			const button1_changes = {};
    			if (dirty & /*phone*/ 2) button1_changes.href = "tel:" + /*phone*/ ctx[1];
    			if (dirty & /*phone*/ 2) button1_changes.caption = /*phone*/ ctx[1];
    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	let { email } = $$props;
    	let { phone } = $$props;
    	let { address } = $$props;
    	const writable_props = ['email', 'phone', 'address'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('phone' in $$props) $$invalidate(1, phone = $$props.phone);
    		if ('address' in $$props) $$invalidate(2, address = $$props.address);
    	};

    	$$self.$capture_state = () => ({ Button, email, phone, address });

    	$$self.$inject_state = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('phone' in $$props) $$invalidate(1, phone = $$props.phone);
    		if ('address' in $$props) $$invalidate(2, address = $$props.address);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [email, phone, address];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { email: 0, phone: 1, address: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*email*/ ctx[0] === undefined && !('email' in props)) {
    			console.warn("<Footer> was created without expected prop 'email'");
    		}

    		if (/*phone*/ ctx[1] === undefined && !('phone' in props)) {
    			console.warn("<Footer> was created without expected prop 'phone'");
    		}

    		if (/*address*/ ctx[2] === undefined && !('address' in props)) {
    			console.warn("<Footer> was created without expected prop 'address'");
    		}
    	}

    	get email() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get phone() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set phone(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get address() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set address(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.42.4 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let style;
    	let t1;
    	let header;
    	let t2;
    	let promo;
    	let t3;
    	let service;
    	let t4;
    	let features;
    	let t5;
    	let about;
    	let t6;
    	let steps;
    	let t7;
    	let partners;
    	let t8;
    	let footer;
    	let t9;
    	let a;
    	let current;
    	let mounted;
    	let dispose;

    	header = new Header({
    			props: {
    				email: /*email*/ ctx[0],
    				phone: /*phone*/ ctx[1]
    			},
    			$$inline: true
    		});

    	promo = new Promo({ $$inline: true });
    	service = new Service({ $$inline: true });
    	features = new Features({ $$inline: true });
    	about = new About({ $$inline: true });
    	steps = new Steps({ $$inline: true });
    	partners = new Partners({ $$inline: true });

    	footer = new Footer({
    			props: {
    				email: /*email*/ ctx[0],
    				phone: /*phone*/ ctx[1],
    				address: /*address*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			style = element("style");
    			style.textContent = "@import url('https://fonts.googleapis.com/css2?family=Jost:wght@200;300;500;700&display=swap');";
    			t1 = space();
    			create_component(header.$$.fragment);
    			t2 = space();
    			create_component(promo.$$.fragment);
    			t3 = space();
    			create_component(service.$$.fragment);
    			t4 = space();
    			create_component(features.$$.fragment);
    			t5 = space();
    			create_component(about.$$.fragment);
    			t6 = space();
    			create_component(steps.$$.fragment);
    			t7 = space();
    			create_component(partners.$$.fragment);
    			t8 = space();
    			create_component(footer.$$.fragment);
    			t9 = space();
    			a = element("a");
    			a.textContent = "↑";
    			add_location(style, file, 17, 4, 554);
    			attr_dev(a, "class", "to-top-btn svelte-1dv90lb");
    			add_location(a, file, 58, 0, 1295);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, style);
    			insert_dev(target, t1, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(promo, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(service, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(features, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(about, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(steps, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(partners, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(footer, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, a, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*email*/ 1) header_changes.email = /*email*/ ctx[0];
    			if (dirty & /*phone*/ 2) header_changes.phone = /*phone*/ ctx[1];
    			header.$set(header_changes);
    			const footer_changes = {};
    			if (dirty & /*email*/ 1) footer_changes.email = /*email*/ ctx[0];
    			if (dirty & /*phone*/ 2) footer_changes.phone = /*phone*/ ctx[1];
    			if (dirty & /*address*/ 4) footer_changes.address = /*address*/ ctx[2];
    			footer.$set(footer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(promo.$$.fragment, local);
    			transition_in(service.$$.fragment, local);
    			transition_in(features.$$.fragment, local);
    			transition_in(about.$$.fragment, local);
    			transition_in(steps.$$.fragment, local);
    			transition_in(partners.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(promo.$$.fragment, local);
    			transition_out(service.$$.fragment, local);
    			transition_out(features.$$.fragment, local);
    			transition_out(about.$$.fragment, local);
    			transition_out(steps.$$.fragment, local);
    			transition_out(partners.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(style);
    			if (detaching) detach_dev(t1);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(promo, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(service, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(features, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(about, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(steps, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(partners, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(footer, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { email } = $$props;
    	let { phone } = $$props;
    	let { address } = $$props;
    	const writable_props = ['email', 'phone', 'address'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => scrollToTop();

    	$$self.$$set = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('phone' in $$props) $$invalidate(1, phone = $$props.phone);
    		if ('address' in $$props) $$invalidate(2, address = $$props.address);
    	};

    	$$self.$capture_state = () => ({
    		animateScroll,
    		Header,
    		Promo,
    		Service,
    		Features,
    		About,
    		Steps,
    		Partners,
    		Footer,
    		email,
    		phone,
    		address
    	});

    	$$self.$inject_state = $$props => {
    		if ('email' in $$props) $$invalidate(0, email = $$props.email);
    		if ('phone' in $$props) $$invalidate(1, phone = $$props.phone);
    		if ('address' in $$props) $$invalidate(2, address = $$props.address);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [email, phone, address, click_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { email: 0, phone: 1, address: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*email*/ ctx[0] === undefined && !('email' in props)) {
    			console.warn("<App> was created without expected prop 'email'");
    		}

    		if (/*phone*/ ctx[1] === undefined && !('phone' in props)) {
    			console.warn("<App> was created without expected prop 'phone'");
    		}

    		if (/*address*/ ctx[2] === undefined && !('address' in props)) {
    			console.warn("<App> was created without expected prop 'address'");
    		}
    	}

    	get email() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set email(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get phone() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set phone(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get address() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set address(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		email: 'zakaz@konteynery-iz-kitaya.ru',
    		address: 'Владивосток',
    		phone: '+7 (983) 170-23-22'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
