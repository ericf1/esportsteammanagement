
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
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
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    /* src/Modal.svelte generated by Svelte v3.47.0 */

    const { console: console_1$4 } = globals;
    const file$5 = "src/Modal.svelte";

    // (79:0) {#if showModal}
    function create_if_block$4(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let if_block0 = /*showLogin*/ ctx[1] && create_if_block_2$3(ctx);
    	let if_block1 = /*showRegister*/ ctx[2] && create_if_block_1$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "modal-container");
    			add_location(div0, file$5, 80, 4, 1812);
    			attr_dev(div1, "class", "backdrop svelte-q4dxxb");
    			add_location(div1, file$5, 79, 2, 1785);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t);
    			if (if_block1) if_block1.m(div0, null);
    		},
    		p: function update(ctx, dirty) {
    			if (/*showLogin*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$3(ctx);
    					if_block0.c();
    					if_block0.m(div0, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showRegister*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(79:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    // (82:6) {#if showLogin}
    function create_if_block_2$3(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let form;
    	let input0;
    	let t3;
    	let input1;
    	let t4;
    	let input2;
    	let t5;
    	let div0;
    	let input3;
    	let t6;
    	let input4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Welcome to League Team Management!";
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			form = element("form");
    			input0 = element("input");
    			t3 = space();
    			input1 = element("input");
    			t4 = space();
    			input2 = element("input");
    			t5 = space();
    			div0 = element("div");
    			input3 = element("input");
    			t6 = space();
    			input4 = element("input");
    			add_location(h1, file$5, 84, 10, 1999);
    			if (!src_url_equal(img.src, img_src_value = "pictures/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "animation logo svelte-q4dxxb");
    			add_location(img, file$5, 85, 10, 2053);
    			attr_dev(input0, "type", "hidden");
    			attr_dev(input0, "name", "login-token");
    			attr_dev(input0, "class", "token");
    			add_location(input0, file$5, 87, 12, 2173);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "Username");
    			attr_dev(input1, "id", "login-user");
    			add_location(input1, file$5, 88, 12, 2242);
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "placeholder", "Password");
    			attr_dev(input2, "id", "login-password");
    			add_location(input2, file$5, 95, 12, 2406);
    			attr_dev(input3, "type", "submit");
    			attr_dev(input3, "id", "login");
    			input3.value = "Login!";
    			add_location(input3, file$5, 102, 14, 2597);
    			attr_dev(input4, "type", "submit");
    			attr_dev(input4, "id", "register");
    			input4.value = "Register!";
    			add_location(input4, file$5, 112, 14, 2889);
    			add_location(div0, file$5, 101, 12, 2577);
    			attr_dev(form, "method", "post");
    			attr_dev(form, "action", "#");
    			add_location(form, file$5, 86, 10, 2129);
    			attr_dev(div1, "id", "login-container");
    			attr_dev(div1, "class", "modal svelte-q4dxxb");
    			add_location(div1, file$5, 82, 8, 1872);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, img);
    			append_dev(div1, t2);
    			append_dev(div1, form);
    			append_dev(form, input0);
    			append_dev(form, t3);
    			append_dev(form, input1);
    			set_input_value(input1, /*username*/ ctx[3]);
    			append_dev(form, t4);
    			append_dev(form, input2);
    			set_input_value(input2, /*password*/ ctx[4]);
    			append_dev(form, t5);
    			append_dev(form, div0);
    			append_dev(div0, input3);
    			append_dev(div0, t6);
    			append_dev(div0, input4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    					listen_dev(input3, "click", prevent_default(/*click_handler*/ ctx[14]), false, true, false),
    					listen_dev(input4, "click", prevent_default(/*click_handler_1*/ ctx[15]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 8 && input1.value !== /*username*/ ctx[3]) {
    				set_input_value(input1, /*username*/ ctx[3]);
    			}

    			if (dirty & /*password*/ 16 && input2.value !== /*password*/ ctx[4]) {
    				set_input_value(input2, /*password*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(82:6) {#if showLogin}",
    		ctx
    	});

    	return block;
    }

    // (128:6) {#if showRegister}
    function create_if_block_1$3(ctx) {
    	let div;
    	let label;
    	let h1;
    	let t1;
    	let form;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let input2;
    	let t4;
    	let input3;
    	let t5;
    	let input4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			h1 = element("h1");
    			h1.textContent = "Register New Account!";
    			t1 = space();
    			form = element("form");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			input2 = element("input");
    			t4 = space();
    			input3 = element("input");
    			t5 = space();
    			input4 = element("input");
    			add_location(h1, file$5, 130, 37, 3443);
    			attr_dev(label, "for", "register-user");
    			add_location(label, file$5, 130, 10, 3416);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Username");
    			attr_dev(input0, "id", "register-user");
    			add_location(input0, file$5, 132, 12, 3573);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "placeholder", "Password");
    			attr_dev(input1, "id", "register-password");
    			add_location(input1, file$5, 139, 12, 3740);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "placeholder", "Email");
    			attr_dev(input2, "id", "register-email");
    			add_location(input2, file$5, 146, 12, 3915);
    			attr_dev(input3, "type", "submit");
    			attr_dev(input3, "id", "register-new-user");
    			input3.value = "Register!";
    			add_location(input3, file$5, 153, 12, 4077);
    			attr_dev(input4, "type", "submit");
    			attr_dev(input4, "id", "exit-register");
    			input4.value = "Exit!";
    			add_location(input4, file$5, 165, 12, 4397);
    			attr_dev(form, "class", "flex-container-horrizonatal svelte-q4dxxb");
    			attr_dev(form, "action", "#");
    			attr_dev(form, "method", "POST");
    			add_location(form, file$5, 131, 10, 3493);
    			attr_dev(div, "id", "register-container");
    			attr_dev(div, "class", "modal svelte-q4dxxb");
    			add_location(div, file$5, 128, 8, 3283);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, h1);
    			append_dev(div, t1);
    			append_dev(div, form);
    			append_dev(form, input0);
    			set_input_value(input0, /*username*/ ctx[3]);
    			append_dev(form, t2);
    			append_dev(form, input1);
    			set_input_value(input1, /*password*/ ctx[4]);
    			append_dev(form, t3);
    			append_dev(form, input2);
    			set_input_value(input2, /*email*/ ctx[5]);
    			append_dev(form, t4);
    			append_dev(form, input3);
    			append_dev(form, t5);
    			append_dev(form, input4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[16]),
    					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[17]),
    					listen_dev(input2, "input", /*input2_input_handler_1*/ ctx[18]),
    					listen_dev(input3, "click", prevent_default(/*click_handler_2*/ ctx[19]), false, true, false),
    					listen_dev(input4, "click", prevent_default(/*click_handler_3*/ ctx[20]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*username*/ 8 && input0.value !== /*username*/ ctx[3]) {
    				set_input_value(input0, /*username*/ ctx[3]);
    			}

    			if (dirty & /*password*/ 16 && input1.value !== /*password*/ ctx[4]) {
    				set_input_value(input1, /*password*/ ctx[4]);
    			}

    			if (dirty & /*email*/ 32 && input2.value !== /*email*/ ctx[5]) {
    				set_input_value(input2, /*email*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(128:6) {#if showRegister}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*showModal*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*showModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Modal', slots, []);
    	let { showModal = true } = $$props;
    	let { showLogin = true } = $$props;
    	let showRegister = false;
    	let username = "";
    	let { correctUsername = "" } = $$props;
    	let { loggedIn = false } = $$props;
    	let password = "";
    	let email = "";
    	let { curID = "" } = $$props;

    	const showRegisterChange = boolean => {
    		$$invalidate(2, showRegister = boolean);
    		$$invalidate(1, showLogin = !boolean);
    	};

    	const checkLogin = () => {
    		let checkUser = { name: username, password };

    		fetch("/logins/login", {
    			method: "POST",
    			body: JSON.stringify(checkUser),
    			headers: { "content-type": "application/json" }
    		}).then(response => response.json()).then(data => {
    			if (data.login) {
    				$$invalidate(1, showLogin = false);
    				$$invalidate(0, showModal = false);
    				$$invalidate(9, correctUsername = data.user);
    				$$invalidate(10, loggedIn = true);
    				$$invalidate(11, curID = data._id);
    				return;
    			}
    			alert(data.message);
    			return;
    		}).catch(error => {
    			console.error("Error:", error);
    		});
    	};

    	function registerPlayer() {
    		if (!password) {
    			alert("Enter a password");
    		}

    		if (!username) {
    			alert("Enter an username");
    		}

    		if (!email) {
    			alert("Enter an email");
    		}

    		let registeredUser = { name: username, password, email };

    		fetch("/logins/register", {
    			method: "POST",
    			body: JSON.stringify(registeredUser),
    			headers: { "content-type": "application/json" }
    		}).then(response => response.json()).then(data => {
    			console.log("Success:", data);
    		}).catch(error => {
    			console.error("Error:", error);
    		});
    	}

    	const writable_props = ['showModal', 'showLogin', 'correctUsername', 'loggedIn', 'curID'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function input1_input_handler() {
    		username = this.value;
    		$$invalidate(3, username);
    	}

    	function input2_input_handler() {
    		password = this.value;
    		$$invalidate(4, password);
    	}

    	const click_handler = () => {
    		checkLogin();
    		$$invalidate(3, username = "");
    		$$invalidate(4, password = "");
    	};

    	const click_handler_1 = () => {
    		showRegisterChange(true);
    		$$invalidate(3, username = "");
    		$$invalidate(4, password = "");
    	};

    	function input0_input_handler() {
    		username = this.value;
    		$$invalidate(3, username);
    	}

    	function input1_input_handler_1() {
    		password = this.value;
    		$$invalidate(4, password);
    	}

    	function input2_input_handler_1() {
    		email = this.value;
    		$$invalidate(5, email);
    	}

    	const click_handler_2 = () => {
    		registerPlayer();
    		$$invalidate(3, username = "");
    		$$invalidate(4, password = "");
    		$$invalidate(5, email = "");
    	};

    	const click_handler_3 = () => {
    		showRegisterChange(false);
    		$$invalidate(3, username = "");
    		$$invalidate(4, password = "");
    		$$invalidate(5, email = "");
    	};

    	$$self.$$set = $$props => {
    		if ('showModal' in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ('showLogin' in $$props) $$invalidate(1, showLogin = $$props.showLogin);
    		if ('correctUsername' in $$props) $$invalidate(9, correctUsername = $$props.correctUsername);
    		if ('loggedIn' in $$props) $$invalidate(10, loggedIn = $$props.loggedIn);
    		if ('curID' in $$props) $$invalidate(11, curID = $$props.curID);
    	};

    	$$self.$capture_state = () => ({
    		showModal,
    		showLogin,
    		showRegister,
    		username,
    		correctUsername,
    		loggedIn,
    		password,
    		email,
    		curID,
    		showRegisterChange,
    		checkLogin,
    		registerPlayer
    	});

    	$$self.$inject_state = $$props => {
    		if ('showModal' in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ('showLogin' in $$props) $$invalidate(1, showLogin = $$props.showLogin);
    		if ('showRegister' in $$props) $$invalidate(2, showRegister = $$props.showRegister);
    		if ('username' in $$props) $$invalidate(3, username = $$props.username);
    		if ('correctUsername' in $$props) $$invalidate(9, correctUsername = $$props.correctUsername);
    		if ('loggedIn' in $$props) $$invalidate(10, loggedIn = $$props.loggedIn);
    		if ('password' in $$props) $$invalidate(4, password = $$props.password);
    		if ('email' in $$props) $$invalidate(5, email = $$props.email);
    		if ('curID' in $$props) $$invalidate(11, curID = $$props.curID);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showModal,
    		showLogin,
    		showRegister,
    		username,
    		password,
    		email,
    		showRegisterChange,
    		checkLogin,
    		registerPlayer,
    		correctUsername,
    		loggedIn,
    		curID,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler,
    		click_handler_1,
    		input0_input_handler,
    		input1_input_handler_1,
    		input2_input_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			showModal: 0,
    			showLogin: 1,
    			correctUsername: 9,
    			loggedIn: 10,
    			curID: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get showModal() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showModal(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showLogin() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showLogin(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get correctUsername() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set correctUsername(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loggedIn() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loggedIn(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get curID() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set curID(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Team.svelte generated by Svelte v3.47.0 */

    const { console: console_1$3 } = globals;
    const file$4 = "src/Team.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[52] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[52] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[60] = list[i];
    	return child_ctx;
    }

    // (274:0) {#if loggedIn}
    function create_if_block_2$2(ctx) {
    	let div0;
    	let h10;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let div2;
    	let div1;
    	let h11;
    	let t6;
    	let p;
    	let t8;
    	let promise_1;
    	let t9;
    	let div4;
    	let div3;
    	let h12;
    	let t11;
    	let t12;
    	let div6;
    	let div5;
    	let h13;
    	let t14;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_5,
    		then: create_then_block_5,
    		catch: create_catch_block_5,
    		value: 60,
    		error: 56
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[3], info);
    	let if_block0 = /*updateOngoing*/ ctx[8] && create_if_block_4(ctx);
    	let if_block1 = /*updateUpcoming*/ ctx[9] && create_if_block_3$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h10 = element("h1");
    			t0 = text("Welcome to your personalized League of Legends Team Management ");
    			t1 = text(/*correctUsername*/ ctx[7]);
    			t2 = text("!");
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Your Teams:";
    			t6 = space();
    			p = element("p");
    			p.textContent = "(Click on them to edit/delete them)";
    			t8 = space();
    			info.block.c();
    			t9 = space();
    			div4 = element("div");
    			div3 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Ongoing Scrims RIGHT NOW:";
    			t11 = space();
    			if (if_block0) if_block0.c();
    			t12 = space();
    			div6 = element("div");
    			div5 = element("div");
    			h13 = element("h1");
    			h13.textContent = "Your Upcoming Accepted Scrims:";
    			t14 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(h10, "class", "welcome-text");
    			add_location(h10, file$4, 275, 4, 6385);
    			if (!src_url_equal(img.src, img_src_value = "pictures/background.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "header-img svelte-euazlj");
    			attr_dev(img, "alt", "pictureofleaguesky");
    			add_location(img, file$4, 278, 4, 6513);
    			attr_dev(div0, "class", "header svelte-euazlj");
    			attr_dev(div0, "title", "header");
    			add_location(div0, file$4, 274, 2, 6345);
    			add_location(h11, file$4, 286, 6, 6679);
    			add_location(p, file$4, 287, 6, 6706);
    			add_location(div1, file$4, 285, 4, 6667);
    			attr_dev(div2, "class", "your-teams-container svelte-euazlj");
    			add_location(div2, file$4, 284, 2, 6628);
    			add_location(h12, file$4, 320, 6, 7431);
    			add_location(div3, file$4, 319, 4, 7419);
    			attr_dev(div4, "class", "ongoing-container svelte-euazlj");
    			add_location(div4, file$4, 318, 2, 7383);
    			add_location(h13, file$4, 378, 6, 9373);
    			add_location(div5, file$4, 377, 4, 9361);
    			attr_dev(div6, "class", "upcoming-container svelte-euazlj");
    			add_location(div6, file$4, 376, 2, 9324);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h10);
    			append_dev(h10, t0);
    			append_dev(h10, t1);
    			append_dev(h10, t2);
    			append_dev(div0, t3);
    			append_dev(div0, img);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h11);
    			append_dev(div1, t6);
    			append_dev(div1, p);
    			append_dev(div2, t8);
    			info.block.m(div2, info.anchor = null);
    			info.mount = () => div2;
    			info.anchor = null;
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, h12);
    			append_dev(div3, t11);
    			if (if_block0) if_block0.m(div3, null);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, h13);
    			append_dev(div5, t14);
    			if (if_block1) if_block1.m(div5, null);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*correctUsername*/ 128) set_data_dev(t1, /*correctUsername*/ ctx[7]);
    			info.ctx = ctx;

    			if (dirty[0] & /*promise*/ 8 && promise_1 !== (promise_1 = /*promise*/ ctx[3]) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}

    			if (/*updateOngoing*/ ctx[8]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div3, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*updateUpcoming*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3$1(ctx);
    					if_block1.c();
    					if_block1.m(div5, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			info.block.d();
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div4);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div6);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(274:0) {#if loggedIn}",
    		ctx
    	});

    	return block;
    }

    // (307:4) {:catch error}
    function create_catch_block_5(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[56].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$4, 307, 6, 7186);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*promise*/ 8 && t_value !== (t_value = /*error*/ ctx[56].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_5.name,
    		type: "catch",
    		source: "(307:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (293:4) {:then user}
    function create_then_block_5(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*user*/ ctx[60];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*promise, editTeam*/ 262152) {
    				each_value_2 = /*user*/ ctx[60];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_5.name,
    		type: "then",
    		source: "(293:4) {:then user}",
    		ctx
    	});

    	return block;
    }

    // (294:6) {#each user as user}
    function create_each_block_2$1(ctx) {
    	let div;
    	let h4;
    	let t0_value = /*user*/ ctx[60].name + "";
    	let t0;
    	let t1;
    	let t2_value = /*user*/ ctx[60].abb + "";
    	let t2;
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[25](/*user*/ ctx[60]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = text("[");
    			t2 = text(t2_value);
    			t3 = text("]");
    			t4 = space();
    			attr_dev(h4, "class", "team");
    			add_location(h4, file$4, 295, 10, 6892);
    			attr_dev(div, "class", "each-team svelte-euazlj");
    			add_location(div, file$4, 294, 8, 6858);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    			append_dev(h4, t2);
    			append_dev(h4, t3);
    			append_dev(div, t4);

    			if (!mounted) {
    				dispose = listen_dev(h4, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*promise*/ 8 && t0_value !== (t0_value = /*user*/ ctx[60].name + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*promise*/ 8 && t2_value !== (t2_value = /*user*/ ctx[60].abb + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(294:6) {#each user as user}",
    		ctx
    	});

    	return block;
    }

    // (291:20)        <p>Loading...</p>     {:then user}
    function create_pending_block_5(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$4, 291, 6, 6788);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_5.name,
    		type: "pending",
    		source: "(291:20)        <p>Loading...</p>     {:then user}",
    		ctx
    	});

    	return block;
    }

    // (322:6) {#if updateOngoing}
    function create_if_block_4(ctx) {
    	let await_block_anchor;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_2$3,
    		then: create_then_block_2$3,
    		catch: create_catch_block_4$2,
    		value: 51,
    		error: 56
    	};

    	handle_promise(/*ongoingScrims*/ ctx[13](), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(322:6) {#if updateOngoing}",
    		ctx
    	});

    	return block;
    }

    // (370:8) {:catch error}
    function create_catch_block_4$2(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[56].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$4, 370, 10, 9230);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_4$2.name,
    		type: "catch",
    		source: "(370:8) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (325:8) {:then notifications}
    function create_then_block_2$3(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*notifications*/ ctx[51];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*ongoingScrims, victorResult, updateOngoing, waitingOngoing, declineScrim, dataDate*/ 62720) {
    				each_value_1 = /*notifications*/ ctx[51];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_2$3.name,
    		type: "then",
    		source: "(325:8) {:then notifications}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_catch_block_3$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_3$2.name,
    		type: "catch",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (327:69)                {#await turnTeamIDToTeamName(notification.oppID) then data}
    function create_then_block_3$2(ctx) {
    	let t;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_4$2,
    		then: create_then_block_4$2,
    		catch: create_catch_block_2$3,
    		value: 55
    	};

    	handle_promise(turnTeamIDToTeamName$2(/*notification*/ ctx[52].oppID), info);

    	const block = {
    		c: function create() {
    			info.block.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t.parentNode;
    			info.anchor = t;
    			insert_dev(target, t, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_3$2.name,
    		type: "then",
    		source: "(327:69)                {#await turnTeamIDToTeamName(notification.oppID) then data}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_catch_block_2$3(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_2$3.name,
    		type: "catch",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (328:73)                  <div>                   <div>                     <h4>Our Team: {us}
    function create_then_block_4$2(ctx) {
    	let div2;
    	let div0;
    	let h40;
    	let t0;
    	let t1_value = /*us*/ ctx[59] + "";
    	let t1;
    	let t2;
    	let t3_value = /*data*/ ctx[55] + "";
    	let t3;
    	let t4;
    	let t5_value = /*dataDate*/ ctx[15](/*notification*/ ctx[52].datetime) + "";
    	let t5;
    	let t6;
    	let h41;
    	let t8;
    	let button0;
    	let t10;
    	let button1;
    	let t11_value = /*us*/ ctx[59] + "";
    	let t11;
    	let t12;
    	let button2;
    	let t13_value = /*data*/ ctx[55] + "";
    	let t13;
    	let t14;
    	let div1;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[26](/*notification*/ ctx[52]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[27](/*notification*/ ctx[52]);
    	}

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[28](/*notification*/ ctx[52]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h40 = element("h4");
    			t0 = text("Our Team: ");
    			t1 = text(t1_value);
    			t2 = text(" vs Enemy Team: ");
    			t3 = text(t3_value);
    			t4 = text("\n                    Time scheduled: ");
    			t5 = text(t5_value);
    			t6 = space();
    			h41 = element("h4");
    			h41.textContent = "Report Results:";
    			t8 = space();
    			button0 = element("button");
    			button0.textContent = "Cancel/Delete";
    			t10 = space();
    			button1 = element("button");
    			t11 = text(t11_value);
    			t12 = space();
    			button2 = element("button");
    			t13 = text(t13_value);
    			t14 = space();
    			div1 = element("div");
    			add_location(h40, file$4, 330, 20, 7841);
    			add_location(div0, file$4, 329, 18, 7815);
    			add_location(h41, file$4, 333, 18, 8000);
    			add_location(button0, file$4, 334, 18, 8043);
    			add_location(button1, file$4, 341, 18, 8311);
    			add_location(button2, file$4, 352, 18, 8706);
    			add_location(div1, file$4, 364, 18, 9104);
    			add_location(div2, file$4, 328, 16, 7791);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h40);
    			append_dev(h40, t0);
    			append_dev(h40, t1);
    			append_dev(h40, t2);
    			append_dev(h40, t3);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    			append_dev(div2, t6);
    			append_dev(div2, h41);
    			append_dev(div2, t8);
    			append_dev(div2, button0);
    			append_dev(div2, t10);
    			append_dev(div2, button1);
    			append_dev(button1, t11);
    			append_dev(div2, t12);
    			append_dev(div2, button2);
    			append_dev(button2, t13);
    			append_dev(div2, t14);
    			append_dev(div2, div1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_1, false, false, false),
    					listen_dev(button1, "click", click_handler_2, false, false, false),
    					listen_dev(button2, "click", click_handler_3, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_4$2.name,
    		type: "then",
    		source: "(328:73)                  <div>                   <div>                     <h4>Our Team: {us}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_pending_block_4$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_4$2.name,
    		type: "pending",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_pending_block_3$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_3$2.name,
    		type: "pending",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (326:10) {#each notifications as notification}
    function create_each_block_1$2(ctx) {
    	let await_block_anchor;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_3$2,
    		then: create_then_block_3$2,
    		catch: create_catch_block_3$2,
    		value: 59
    	};

    	handle_promise(turnTeamIDToTeamName$2(/*notification*/ ctx[52].ourID), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(326:10) {#each notifications as notification}",
    		ctx
    	});

    	return block;
    }

    // (323:32)            <p>Loading...</p>         {:then notifications}
    function create_pending_block_2$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$4, 323, 10, 7535);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_2$3.name,
    		type: "pending",
    		source: "(323:32)            <p>Loading...</p>         {:then notifications}",
    		ctx
    	});

    	return block;
    }

    // (380:6) {#if updateUpcoming}
    function create_if_block_3$1(ctx) {
    	let await_block_anchor;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block_1$3,
    		value: 51,
    		error: 56
    	};

    	handle_promise(/*upcomingScrims*/ ctx[16](), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(380:6) {#if updateUpcoming}",
    		ctx
    	});

    	return block;
    }

    // (402:8) {:catch error}
    function create_catch_block_1$3(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[56].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$4, 402, 10, 10202);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1$3.name,
    		type: "catch",
    		source: "(402:8) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (383:8) {:then notifications}
    function create_then_block$3(ctx) {
    	let each_1_anchor;
    	let each_value = /*notifications*/ ctx[51];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*upcomingScrims, declineScrim, updateUpcoming, waitingUpcoming, dataDate*/ 117248) {
    				each_value = /*notifications*/ ctx[51];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$3.name,
    		type: "then",
    		source: "(383:8) {:then notifications}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_catch_block$3(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$3.name,
    		type: "catch",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (388:71)                <div>                 {data}
    function create_then_block_1$3(ctx) {
    	let div;
    	let t0_value = /*data*/ ctx[55] + "";
    	let t0;
    	let t1;
    	let t2_value = /*dataDate*/ ctx[15](/*notification*/ ctx[52].datetime) + "";
    	let t2;
    	let t3;
    	let button;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler_4() {
    		return /*click_handler_4*/ ctx[29](/*notification*/ ctx[52]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			button.textContent = "Cancel/Delete";
    			t5 = space();
    			add_location(button, file$4, 391, 16, 9869);
    			add_location(div, file$4, 388, 14, 9774);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, button);
    			insert_dev(target, t5, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_4, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t5);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1$3.name,
    		type: "then",
    		source: "(388:71)                <div>                 {data}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_pending_block_1$3(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1$3.name,
    		type: "pending",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (384:10) {#each notifications as notification}
    function create_each_block$3(ctx) {
    	let await_block_anchor;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1$3,
    		then: create_then_block_1$3,
    		catch: create_catch_block$3,
    		value: 55
    	};

    	handle_promise(turnTeamIDToTeamName$2(/*notification*/ ctx[52].oppID), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(384:10) {#each notifications as notification}",
    		ctx
    	});

    	return block;
    }

    // (381:33)            <p>Loading...</p>         {:then notifications}
    function create_pending_block$3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$4, 381, 10, 9484);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(381:33)            <p>Loading...</p>         {:then notifications}",
    		ctx
    	});

    	return block;
    }

    // (410:0) {#if teamEdit}
    function create_if_block_1$2(ctx) {
    	let div0;
    	let t0;
    	let div7;
    	let form;
    	let h10;
    	let t2;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let label1;
    	let t5;
    	let input1;
    	let t6;
    	let div6;
    	let h11;
    	let t8;
    	let div1;
    	let t9;
    	let input2;
    	let input2_value_value;
    	let t10;
    	let div2;
    	let t11;
    	let input3;
    	let input3_value_value;
    	let t12;
    	let div3;
    	let t13;
    	let input4;
    	let input4_value_value;
    	let t14;
    	let div4;
    	let t15;
    	let input5;
    	let input5_value_value;
    	let t16;
    	let div5;
    	let t17;
    	let input6;
    	let input6_value_value;
    	let t18;
    	let input7;
    	let t19;
    	let input8;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div7 = element("div");
    			form = element("form");
    			h10 = element("h1");
    			h10.textContent = "Edit Your Team Information!";
    			t2 = space();
    			label0 = element("label");
    			t3 = text("Team name: ");
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			t5 = text("Abbriviation: ");
    			input1 = element("input");
    			t6 = space();
    			div6 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Members";
    			t8 = space();
    			div1 = element("div");
    			t9 = text("Player 1:");
    			input2 = element("input");
    			t10 = space();
    			div2 = element("div");
    			t11 = text("Player 2:");
    			input3 = element("input");
    			t12 = space();
    			div3 = element("div");
    			t13 = text("Player 3:");
    			input4 = element("input");
    			t14 = space();
    			div4 = element("div");
    			t15 = text("Player 4:");
    			input5 = element("input");
    			t16 = space();
    			div5 = element("div");
    			t17 = text("Player 5:");
    			input6 = element("input");
    			t18 = space();
    			input7 = element("input");
    			t19 = space();
    			input8 = element("input");
    			attr_dev(div0, "class", "backdrop svelte-euazlj");
    			add_location(div0, file$4, 410, 2, 10317);
    			add_location(h10, file$4, 421, 6, 10564);
    			attr_dev(input0, "type", "text");
    			input0.value = /*teamName*/ ctx[2];
    			add_location(input0, file$4, 423, 20, 10634);
    			add_location(label0, file$4, 422, 6, 10607);
    			attr_dev(input1, "type", "text");
    			input1.value = /*abb*/ ctx[5];
    			add_location(input1, file$4, 430, 23, 10808);
    			add_location(label1, file$4, 429, 6, 10778);
    			add_location(h11, file$4, 437, 8, 10980);
    			attr_dev(input2, "type", "text");
    			input2.value = input2_value_value = /*players*/ ctx[4][0];
    			add_location(input2, file$4, 439, 19, 11030);
    			add_location(div1, file$4, 438, 8, 11005);
    			attr_dev(input3, "type", "text");
    			input3.value = input3_value_value = /*players*/ ctx[4][1];
    			add_location(input3, file$4, 446, 19, 11213);
    			add_location(div2, file$4, 445, 8, 11188);
    			attr_dev(input4, "type", "text");
    			input4.value = input4_value_value = /*players*/ ctx[4][2];
    			add_location(input4, file$4, 453, 19, 11396);
    			add_location(div3, file$4, 452, 8, 11371);
    			attr_dev(input5, "type", "text");
    			input5.value = input5_value_value = /*players*/ ctx[4][3];
    			add_location(input5, file$4, 460, 19, 11579);
    			add_location(div4, file$4, 459, 8, 11554);
    			attr_dev(input6, "type", "text");
    			input6.value = input6_value_value = /*players*/ ctx[4][4];
    			add_location(input6, file$4, 468, 19, 11763);
    			add_location(div5, file$4, 467, 8, 11738);
    			attr_dev(div6, "class", "input-teammates svelte-euazlj");
    			add_location(div6, file$4, 436, 6, 10942);
    			attr_dev(input7, "type", "submit");
    			attr_dev(input7, "name", "Edit");
    			input7.value = "Edit";
    			add_location(input7, file$4, 475, 6, 11932);
    			attr_dev(input8, "type", "submit");
    			attr_dev(input8, "name", "Delete");
    			input8.value = "Delete";
    			add_location(input8, file$4, 486, 6, 12146);
    			attr_dev(form, "action", "#");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "class", "modal svelte-euazlj");
    			add_location(form, file$4, 420, 4, 10512);
    			attr_dev(div7, "class", "modal-container");
    			add_location(div7, file$4, 419, 2, 10478);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, form);
    			append_dev(form, h10);
    			append_dev(form, t2);
    			append_dev(form, label0);
    			append_dev(label0, t3);
    			append_dev(label0, input0);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(label1, t5);
    			append_dev(label1, input1);
    			append_dev(form, t6);
    			append_dev(form, div6);
    			append_dev(div6, h11);
    			append_dev(div6, t8);
    			append_dev(div6, div1);
    			append_dev(div1, t9);
    			append_dev(div1, input2);
    			append_dev(div6, t10);
    			append_dev(div6, div2);
    			append_dev(div2, t11);
    			append_dev(div2, input3);
    			append_dev(div6, t12);
    			append_dev(div6, div3);
    			append_dev(div3, t13);
    			append_dev(div3, input4);
    			append_dev(div6, t14);
    			append_dev(div6, div4);
    			append_dev(div4, t15);
    			append_dev(div4, input5);
    			append_dev(div6, t16);
    			append_dev(div6, div5);
    			append_dev(div5, t17);
    			append_dev(div5, input6);
    			append_dev(form, t18);
    			append_dev(form, input7);
    			append_dev(form, t19);
    			append_dev(form, input8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler_5*/ ctx[30], false, false, false),
    					listen_dev(input0, "input", /*input_handler*/ ctx[31], false, false, false),
    					listen_dev(input1, "input", /*input_handler_1*/ ctx[32], false, false, false),
    					listen_dev(input2, "input", /*input_handler_2*/ ctx[33], false, false, false),
    					listen_dev(input3, "input", /*input_handler_3*/ ctx[34], false, false, false),
    					listen_dev(input4, "input", /*input_handler_4*/ ctx[35], false, false, false),
    					listen_dev(input5, "input", /*input_handler_5*/ ctx[36], false, false, false),
    					listen_dev(input6, "input", /*input_handler_6*/ ctx[37], false, false, false),
    					listen_dev(input7, "click", /*click_handler_6*/ ctx[38], false, false, false),
    					listen_dev(input8, "click", /*click_handler_7*/ ctx[39], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*teamName*/ 4 && input0.value !== /*teamName*/ ctx[2]) {
    				prop_dev(input0, "value", /*teamName*/ ctx[2]);
    			}

    			if (dirty[0] & /*abb*/ 32 && input1.value !== /*abb*/ ctx[5]) {
    				prop_dev(input1, "value", /*abb*/ ctx[5]);
    			}

    			if (dirty[0] & /*players*/ 16 && input2_value_value !== (input2_value_value = /*players*/ ctx[4][0]) && input2.value !== input2_value_value) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (dirty[0] & /*players*/ 16 && input3_value_value !== (input3_value_value = /*players*/ ctx[4][1]) && input3.value !== input3_value_value) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (dirty[0] & /*players*/ 16 && input4_value_value !== (input4_value_value = /*players*/ ctx[4][2]) && input4.value !== input4_value_value) {
    				prop_dev(input4, "value", input4_value_value);
    			}

    			if (dirty[0] & /*players*/ 16 && input5_value_value !== (input5_value_value = /*players*/ ctx[4][3]) && input5.value !== input5_value_value) {
    				prop_dev(input5, "value", input5_value_value);
    			}

    			if (dirty[0] & /*players*/ 16 && input6_value_value !== (input6_value_value = /*players*/ ctx[4][4]) && input6.value !== input6_value_value) {
    				prop_dev(input6, "value", input6_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(410:0) {#if teamEdit}",
    		ctx
    	});

    	return block;
    }

    // (501:0) {#if clickedRegister}
    function create_if_block$3(ctx) {
    	let div0;
    	let t0;
    	let div7;
    	let form;
    	let h10;
    	let t2;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let label1;
    	let t5;
    	let input1;
    	let t6;
    	let div6;
    	let h11;
    	let t8;
    	let div1;
    	let t9;
    	let input2;
    	let input2_value_value;
    	let t10;
    	let div2;
    	let t11;
    	let input3;
    	let input3_value_value;
    	let t12;
    	let div3;
    	let t13;
    	let input4;
    	let input4_value_value;
    	let t14;
    	let div4;
    	let t15;
    	let input5;
    	let input5_value_value;
    	let t16;
    	let div5;
    	let t17;
    	let input6;
    	let input6_value_value;
    	let t18;
    	let input7;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div7 = element("div");
    			form = element("form");
    			h10 = element("h1");
    			h10.textContent = "Enter Your Team Information!";
    			t2 = space();
    			label0 = element("label");
    			t3 = text("Team name: ");
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			t5 = text("Abbriviation: ");
    			input1 = element("input");
    			t6 = space();
    			div6 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Members";
    			t8 = space();
    			div1 = element("div");
    			t9 = text("Player 1:");
    			input2 = element("input");
    			t10 = space();
    			div2 = element("div");
    			t11 = text("Player 2:");
    			input3 = element("input");
    			t12 = space();
    			div3 = element("div");
    			t13 = text("Player 3:");
    			input4 = element("input");
    			t14 = space();
    			div4 = element("div");
    			t15 = text("Player 4:");
    			input5 = element("input");
    			t16 = space();
    			div5 = element("div");
    			t17 = text("Player 5:");
    			input6 = element("input");
    			t18 = space();
    			input7 = element("input");
    			attr_dev(div0, "class", "backdrop svelte-euazlj");
    			add_location(div0, file$4, 501, 2, 12409);
    			add_location(h10, file$4, 512, 6, 12663);
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$4, 513, 24, 12725);
    			add_location(label0, file$4, 513, 6, 12707);
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$4, 514, 27, 12804);
    			add_location(label1, file$4, 514, 6, 12783);
    			add_location(h11, file$4, 517, 8, 12896);
    			attr_dev(input2, "type", "text");
    			input2.value = input2_value_value = /*players*/ ctx[4][0];
    			add_location(input2, file$4, 519, 19, 12946);
    			add_location(div1, file$4, 518, 8, 12921);
    			attr_dev(input3, "type", "text");
    			input3.value = input3_value_value = /*players*/ ctx[4][1];
    			add_location(input3, file$4, 526, 19, 13129);
    			add_location(div2, file$4, 525, 8, 13104);
    			attr_dev(input4, "type", "text");
    			input4.value = input4_value_value = /*players*/ ctx[4][2];
    			add_location(input4, file$4, 533, 19, 13312);
    			add_location(div3, file$4, 532, 8, 13287);
    			attr_dev(input5, "type", "text");
    			input5.value = input5_value_value = /*players*/ ctx[4][3];
    			add_location(input5, file$4, 540, 19, 13495);
    			add_location(div4, file$4, 539, 8, 13470);
    			attr_dev(input6, "type", "text");
    			input6.value = input6_value_value = /*players*/ ctx[4][4];
    			add_location(input6, file$4, 548, 19, 13679);
    			add_location(div5, file$4, 547, 8, 13654);
    			attr_dev(div6, "class", "input-teammates svelte-euazlj");
    			add_location(div6, file$4, 516, 6, 12858);
    			attr_dev(input7, "type", "submit");
    			attr_dev(input7, "name", "Submit");
    			input7.value = "Submit";
    			add_location(input7, file$4, 556, 6, 13849);
    			attr_dev(form, "action", "#");
    			attr_dev(form, "method", "POST");
    			attr_dev(form, "class", "modal svelte-euazlj");
    			add_location(form, file$4, 511, 4, 12611);
    			attr_dev(div7, "class", "modal-container");
    			add_location(div7, file$4, 510, 2, 12577);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, form);
    			append_dev(form, h10);
    			append_dev(form, t2);
    			append_dev(form, label0);
    			append_dev(label0, t3);
    			append_dev(label0, input0);
    			set_input_value(input0, /*teamName*/ ctx[2]);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(label1, t5);
    			append_dev(label1, input1);
    			set_input_value(input1, /*abb*/ ctx[5]);
    			append_dev(form, t6);
    			append_dev(form, div6);
    			append_dev(div6, h11);
    			append_dev(div6, t8);
    			append_dev(div6, div1);
    			append_dev(div1, t9);
    			append_dev(div1, input2);
    			append_dev(div6, t10);
    			append_dev(div6, div2);
    			append_dev(div2, t11);
    			append_dev(div2, input3);
    			append_dev(div6, t12);
    			append_dev(div6, div3);
    			append_dev(div3, t13);
    			append_dev(div3, input4);
    			append_dev(div6, t14);
    			append_dev(div6, div4);
    			append_dev(div4, t15);
    			append_dev(div4, input5);
    			append_dev(div6, t16);
    			append_dev(div6, div5);
    			append_dev(div5, t17);
    			append_dev(div5, input6);
    			append_dev(form, t18);
    			append_dev(form, input7);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler_8*/ ctx[40], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[41]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[42]),
    					listen_dev(input2, "input", /*input_handler_7*/ ctx[43], false, false, false),
    					listen_dev(input3, "input", /*input_handler_8*/ ctx[44], false, false, false),
    					listen_dev(input4, "input", /*input_handler_9*/ ctx[45], false, false, false),
    					listen_dev(input5, "input", /*input_handler_10*/ ctx[46], false, false, false),
    					listen_dev(input6, "input", /*input_handler_11*/ ctx[47], false, false, false),
    					listen_dev(input7, "click", /*click_handler_9*/ ctx[48], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*teamName*/ 4 && input0.value !== /*teamName*/ ctx[2]) {
    				set_input_value(input0, /*teamName*/ ctx[2]);
    			}

    			if (dirty[0] & /*abb*/ 32 && input1.value !== /*abb*/ ctx[5]) {
    				set_input_value(input1, /*abb*/ ctx[5]);
    			}

    			if (dirty[0] & /*players*/ 16 && input2_value_value !== (input2_value_value = /*players*/ ctx[4][0]) && input2.value !== input2_value_value) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (dirty[0] & /*players*/ 16 && input3_value_value !== (input3_value_value = /*players*/ ctx[4][1]) && input3.value !== input3_value_value) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (dirty[0] & /*players*/ 16 && input4_value_value !== (input4_value_value = /*players*/ ctx[4][2]) && input4.value !== input4_value_value) {
    				prop_dev(input4, "value", input4_value_value);
    			}

    			if (dirty[0] & /*players*/ 16 && input5_value_value !== (input5_value_value = /*players*/ ctx[4][3]) && input5.value !== input5_value_value) {
    				prop_dev(input5, "value", input5_value_value);
    			}

    			if (dirty[0] & /*players*/ 16 && input6_value_value !== (input6_value_value = /*players*/ ctx[4][4]) && input6.value !== input6_value_value) {
    				prop_dev(input6, "value", input6_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(501:0) {#if clickedRegister}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let t0;
    	let t1;
    	let if_block2_anchor;
    	let if_block0 = /*loggedIn*/ ctx[0] && create_if_block_2$2(ctx);
    	let if_block1 = /*teamEdit*/ ctx[1] && create_if_block_1$2(ctx);
    	let if_block2 = /*clickedRegister*/ ctx[6] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*loggedIn*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*teamEdit*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*clickedRegister*/ ctx[6]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$3(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
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

    const regex = /\b[a-zA-Z]/g;

    async function turnTeamIDToTeamName$2(teamString) {
    	let res = await fetch("/teams/edit", {
    		method: "POST",
    		body: JSON.stringify({ _id: teamString }),
    		headers: { "content-type": "application/json" }
    	});

    	let json = await res.json();
    	return await json[0].name;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Team', slots, []);
    	let { loggedIn = false } = $$props;
    	let { correctUsername = "" } = $$props;
    	let { promise = null } = $$props;
    	let { teamEdit = false } = $$props;
    	let { players = ["", "", "", "", ""] } = $$props;
    	let { teamName } = $$props;
    	let { abb } = $$props;
    	let { _id } = $$props;
    	let { updateTeamBoolean = false } = $$props;
    	let { clickedRegister = false } = $$props;
    	let promise2;
    	let updateOngoing = true;
    	let updateUpcoming = true;

    	const waitingOngoing = new Promise(() => {
    			setTimeout(
    				() => {
    					$$invalidate(8, updateOngoing = true);
    				},
    				15
    			);
    		});

    	const waitingUpcoming = new Promise(() => {
    			setTimeout(
    				() => {
    					$$invalidate(9, updateUpcoming = true);
    				},
    				15
    			);
    		});

    	const victorResult = async (eventID, victorID, loserID) => {
    		let res = await fetch("/teams/report-scrim", {
    			method: "POST",
    			body: JSON.stringify({
    				_id: eventID,
    				victor: victorID,
    				loser: loserID
    			}),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	const ongoingScrims = async () => {
    		let res = await fetch("/teams/ongoing-scrims", {
    			method: "POST",
    			body: JSON.stringify({ teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	const declineScrim = async id => {
    		await fetch("/teams/declined-scrims", {
    			method: "POST",
    			body: JSON.stringify({ _id: id }),
    			headers: { "content-type": "application/json" }
    		});

    		$$invalidate(0, loggedIn = false);

    		let timeout = new Promise(() => {
    				setTimeout(
    					() => {
    						$$invalidate(0, loggedIn = true);
    					},
    					5
    				);
    			});

    		timeout();
    	};

    	const dataDate = timestamp => {
    		var unixtimestamp = timestamp;

    		var months_arr = [
    			"Jan",
    			"Feb",
    			"Mar",
    			"Apr",
    			"May",
    			"Jun",
    			"Jul",
    			"Aug",
    			"Sep",
    			"Oct",
    			"Nov",
    			"Dec"
    		];

    		var date = new Date(unixtimestamp * 1000);
    		var year = date.getFullYear();
    		var month = months_arr[date.getMonth()];
    		var day = date.getDate();
    		var hours = "0" + date.getHours();
    		var minutes = "0" + date.getMinutes();

    		// Display date time in MM-dd-yyyy h:m:s format
    		var convdataTime = month + "-" + day + "-" + year + " " + hours.substr(-2) + ":" + minutes.substr(-2);

    		return convdataTime;
    	};

    	const upcomingScrims = async () => {
    		let res = await fetch("/teams/future-scrims", {
    			method: "POST",
    			body: JSON.stringify({ teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	const listTeamReset = () => {
    		$$invalidate(0, loggedIn = false);

    		setTimeout(
    			() => {
    				$$invalidate(0, loggedIn = true);
    			},
    			15
    		);
    	};

    	const editTeam = (pplayers, pteamName, pabb, p_id) => {
    		$$invalidate(1, teamEdit = true);
    		$$invalidate(4, players = pplayers);
    		$$invalidate(2, teamName = pteamName);
    		$$invalidate(5, abb = pabb);
    		$$invalidate(22, _id = p_id);
    		console.log(players, teamName, abb, _id);
    	};

    	const listTeams = async () => {
    		let res = await fetch("/teams/list", {
    			method: "POST",
    			body: JSON.stringify({ teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	//editTeam
    	const updateTeam = () => {
    		if (!teamName) {
    			alert("Enter a teamname");
    			return;
    		}

    		if (!abb) {
    			alert("Enter an abbriviation");
    			return;
    		}

    		if (!players[0] || !players[1] || !players[2] || !players[3] || !players[4]) {
    			alert("You don't have enough players :(");
    			return;
    		}

    		let registeredTeam = { teamName, abb, members: players, _id };

    		fetch("/teams/update", {
    			method: "POST",
    			body: JSON.stringify(registeredTeam),
    			headers: { "content-type": "application/json" }
    		}).then(response => response.json()).then(data => {
    			console.log("Success:", data);
    		}).catch(error => {
    			console.error("Error:", error);
    		});

    		listTeamReset();
    	};

    	const listTeamsForm = async () => {
    		let res = await fetch("/teams/edit", {
    			method: "POST",
    			body: JSON.stringify({ _id }),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	const deleteTeam = async () => {
    		let res = await fetch("/teams/delete", {
    			method: "POST",
    			body: JSON.stringify({ _id }),
    			headers: { "content-type": "application/json" }
    		});

    		await listTeamReset();
    		return await res.json();
    	};

    	//registerTeam!players[
    	const newTeam = () => {
    		if (!teamName) {
    			alert("Enter a teamname");
    			return;
    		}

    		if (!abb) {
    			alert("Enter an abbriviation");
    			return;
    		}

    		if (!players[0] || !players[1] || !players[2] || !players[3] || !players[4]) {
    			alert("You don't have enough players :(");
    			return;
    		}

    		let registeredTeam = {
    			teamName,
    			abb,
    			members: players,
    			teamOwner: correctUsername
    		};

    		fetch("/teams/register-team", {
    			method: "POST",
    			body: JSON.stringify(registeredTeam),
    			headers: { "content-type": "application/json" }
    		}).then(response => response.json()).then(data => {
    			console.log("Success:", data);
    		}).catch(error => {
    			console.error("Error:", error);
    		});
    	};

    	const writable_props = [
    		'loggedIn',
    		'correctUsername',
    		'promise',
    		'teamEdit',
    		'players',
    		'teamName',
    		'abb',
    		'_id',
    		'updateTeamBoolean',
    		'clickedRegister'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Team> was created with unknown prop '${key}'`);
    	});

    	const click_handler = user => {
    		console.log(user);
    		editTeam(user.name, user.abb, user.members, user._id);
    	};

    	const click_handler_1 = notification => {
    		declineScrim(notification._id);
    		$$invalidate(8, updateOngoing = false);
    		waitingOngoing();
    	};

    	const click_handler_2 = notification => {
    		victorResult(notification._id, notification.ourID, notification.oppID);
    		$$invalidate(8, updateOngoing = false);
    		waitingOngoing();
    	};

    	const click_handler_3 = notification => {
    		victorResult(notification._id, notification.oppID, notification.ourID);
    		$$invalidate(8, updateOngoing = false);
    		waitingOngoing();
    	};

    	const click_handler_4 = notification => {
    		declineScrim(notification._id);
    		$$invalidate(9, updateUpcoming = false);
    		waitingUpcoming();
    	};

    	const click_handler_5 = () => {
    		$$invalidate(2, teamName = "");
    		$$invalidate(5, abb = "");
    		$$invalidate(4, players = ["", "", "", "", ""]);
    		$$invalidate(1, teamEdit = false);
    	};

    	const input_handler = e => $$invalidate(2, teamName = e.target.value);
    	const input_handler_1 = e => $$invalidate(5, abb = e.target.value);
    	const input_handler_2 = e => $$invalidate(4, players[0] = e.target.value, players);
    	const input_handler_3 = e => $$invalidate(4, players[1] = e.target.value, players);
    	const input_handler_4 = e => $$invalidate(4, players[2] = e.target.value, players);
    	const input_handler_5 = e => $$invalidate(4, players[3] = e.target.value, players);
    	const input_handler_6 = e => $$invalidate(4, players[4] = e.target.value, players);

    	const click_handler_6 = event => {
    		event.preventDefault();
    		updateTeam();
    		$$invalidate(1, teamEdit = false);
    	};

    	const click_handler_7 = event => {
    		event.preventDefault();
    		deleteTeam();
    		$$invalidate(1, teamEdit = false);
    	};

    	const click_handler_8 = () => {
    		$$invalidate(2, teamName = "");
    		$$invalidate(5, abb = "");
    		$$invalidate(4, players = ["", "", "", "", ""]);
    		$$invalidate(6, clickedRegister = false);
    	};

    	function input0_input_handler() {
    		teamName = this.value;
    		(($$invalidate(2, teamName), $$invalidate(1, teamEdit)), $$invalidate(24, promise2));
    	}

    	function input1_input_handler() {
    		abb = this.value;
    		((($$invalidate(5, abb), $$invalidate(1, teamEdit)), $$invalidate(24, promise2)), $$invalidate(2, teamName));
    	}

    	const input_handler_7 = e => $$invalidate(4, players[0] = e.target.value, players);
    	const input_handler_8 = e => $$invalidate(4, players[1] = e.target.value, players);
    	const input_handler_9 = e => $$invalidate(4, players[2] = e.target.value, players);
    	const input_handler_10 = e => $$invalidate(4, players[3] = e.target.value, players);
    	const input_handler_11 = e => $$invalidate(4, players[4] = e.target.value, players);

    	const click_handler_9 = event => {
    		event.preventDefault();
    		newTeam();
    		listTeamReset();
    		$$invalidate(6, clickedRegister = false);
    		$$invalidate(2, teamName = "");
    		$$invalidate(5, abb = "");
    		$$invalidate(4, players = ["", "", "", "", ""]);
    	};

    	$$self.$$set = $$props => {
    		if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    		if ('correctUsername' in $$props) $$invalidate(7, correctUsername = $$props.correctUsername);
    		if ('promise' in $$props) $$invalidate(3, promise = $$props.promise);
    		if ('teamEdit' in $$props) $$invalidate(1, teamEdit = $$props.teamEdit);
    		if ('players' in $$props) $$invalidate(4, players = $$props.players);
    		if ('teamName' in $$props) $$invalidate(2, teamName = $$props.teamName);
    		if ('abb' in $$props) $$invalidate(5, abb = $$props.abb);
    		if ('_id' in $$props) $$invalidate(22, _id = $$props._id);
    		if ('updateTeamBoolean' in $$props) $$invalidate(23, updateTeamBoolean = $$props.updateTeamBoolean);
    		if ('clickedRegister' in $$props) $$invalidate(6, clickedRegister = $$props.clickedRegister);
    	};

    	$$self.$capture_state = () => ({
    		loggedIn,
    		correctUsername,
    		promise,
    		teamEdit,
    		players,
    		teamName,
    		abb,
    		_id,
    		updateTeamBoolean,
    		clickedRegister,
    		promise2,
    		updateOngoing,
    		updateUpcoming,
    		waitingOngoing,
    		waitingUpcoming,
    		victorResult,
    		regex,
    		ongoingScrims,
    		declineScrim,
    		dataDate,
    		turnTeamIDToTeamName: turnTeamIDToTeamName$2,
    		upcomingScrims,
    		listTeamReset,
    		editTeam,
    		listTeams,
    		updateTeam,
    		listTeamsForm,
    		deleteTeam,
    		newTeam
    	});

    	$$self.$inject_state = $$props => {
    		if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    		if ('correctUsername' in $$props) $$invalidate(7, correctUsername = $$props.correctUsername);
    		if ('promise' in $$props) $$invalidate(3, promise = $$props.promise);
    		if ('teamEdit' in $$props) $$invalidate(1, teamEdit = $$props.teamEdit);
    		if ('players' in $$props) $$invalidate(4, players = $$props.players);
    		if ('teamName' in $$props) $$invalidate(2, teamName = $$props.teamName);
    		if ('abb' in $$props) $$invalidate(5, abb = $$props.abb);
    		if ('_id' in $$props) $$invalidate(22, _id = $$props._id);
    		if ('updateTeamBoolean' in $$props) $$invalidate(23, updateTeamBoolean = $$props.updateTeamBoolean);
    		if ('clickedRegister' in $$props) $$invalidate(6, clickedRegister = $$props.clickedRegister);
    		if ('promise2' in $$props) $$invalidate(24, promise2 = $$props.promise2);
    		if ('updateOngoing' in $$props) $$invalidate(8, updateOngoing = $$props.updateOngoing);
    		if ('updateUpcoming' in $$props) $$invalidate(9, updateUpcoming = $$props.updateUpcoming);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*teamEdit, promise2*/ 16777218) {
    			if (teamEdit) {
    				$$invalidate(24, promise2 = listTeamsForm());

    				promise2.then(val => {
    					$$invalidate(2, teamName = val[0].name);
    					$$invalidate(5, abb = val[0].abb);
    					$$invalidate(4, players = val[0].members);

    					//   console.log(players);
    					console.log("help");
    				});
    			}
    		}

    		if ($$self.$$.dirty[0] & /*teamName*/ 4) {
    			if (teamName) {
    				$$invalidate(5, abb = teamName.match(regex).join("").toUpperCase());
    			}
    		}

    		if ($$self.$$.dirty[0] & /*loggedIn*/ 1) {
    			if (loggedIn) {
    				$$invalidate(3, promise = listTeams());
    			}
    		}

    		if ($$self.$$.dirty[0] & /*updateTeamBoolean*/ 8388608) {
    			if (updateTeamBoolean) {
    				$$invalidate(3, promise = listTeams());
    				updateTeamTrue = false;
    			}
    		}
    	};

    	return [
    		loggedIn,
    		teamEdit,
    		teamName,
    		promise,
    		players,
    		abb,
    		clickedRegister,
    		correctUsername,
    		updateOngoing,
    		updateUpcoming,
    		waitingOngoing,
    		waitingUpcoming,
    		victorResult,
    		ongoingScrims,
    		declineScrim,
    		dataDate,
    		upcomingScrims,
    		listTeamReset,
    		editTeam,
    		updateTeam,
    		deleteTeam,
    		newTeam,
    		_id,
    		updateTeamBoolean,
    		promise2,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		input_handler,
    		input_handler_1,
    		input_handler_2,
    		input_handler_3,
    		input_handler_4,
    		input_handler_5,
    		input_handler_6,
    		click_handler_6,
    		click_handler_7,
    		click_handler_8,
    		input0_input_handler,
    		input1_input_handler,
    		input_handler_7,
    		input_handler_8,
    		input_handler_9,
    		input_handler_10,
    		input_handler_11,
    		click_handler_9
    	];
    }

    class Team extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				loggedIn: 0,
    				correctUsername: 7,
    				promise: 3,
    				teamEdit: 1,
    				players: 4,
    				teamName: 2,
    				abb: 5,
    				_id: 22,
    				updateTeamBoolean: 23,
    				clickedRegister: 6
    			},
    			null,
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Team",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*teamName*/ ctx[2] === undefined && !('teamName' in props)) {
    			console_1$3.warn("<Team> was created without expected prop 'teamName'");
    		}

    		if (/*abb*/ ctx[5] === undefined && !('abb' in props)) {
    			console_1$3.warn("<Team> was created without expected prop 'abb'");
    		}

    		if (/*_id*/ ctx[22] === undefined && !('_id' in props)) {
    			console_1$3.warn("<Team> was created without expected prop '_id'");
    		}
    	}

    	get loggedIn() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loggedIn(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get correctUsername() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set correctUsername(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get promise() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set promise(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get teamEdit() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set teamEdit(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get players() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set players(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get teamName() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set teamName(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get abb() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set abb(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get _id() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set _id(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateTeamBoolean() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateTeamBoolean(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickedRegister() {
    		throw new Error("<Team>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickedRegister(value) {
    		throw new Error("<Team>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/MatchHistory.svelte generated by Svelte v3.47.0 */

    const file$3 = "src/MatchHistory.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (32:0) {#if matchHistoryToggle}
    function create_if_block$2(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block_2$2,
    		value: 4
    	};

    	handle_promise(/*fetchMatchHistory*/ ctx[1](), info);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			info.block.c();
    			attr_dev(div0, "class", "backdrop svelte-btguvb");
    			add_location(div0, file$3, 32, 2, 857);
    			attr_dev(div1, "id", "match-history-container");
    			attr_dev(div1, "class", "modal svelte-btguvb");
    			add_location(div1, file$3, 38, 2, 953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			info.block.m(div1, info.anchor = null);
    			info.mount = () => div1;
    			info.anchor = null;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(32:0) {#if matchHistoryToggle}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch("/teams/edit", {       method: "POST",       body: JSON.stringify({ _id: teamString }
    function create_catch_block_2$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_2$2.name,
    		type: "catch",
    		source: "(1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch(\\\"/teams/edit\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: teamString }",
    		ctx
    	});

    	return block;
    }

    // (42:4) {:then matchHistory}
    function create_then_block$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*matchHistory*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*turnTeamIDToTeamName, fetchMatchHistory*/ 2) {
    				each_value = /*matchHistory*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(42:4) {:then matchHistory}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch("/teams/edit", {       method: "POST",       body: JSON.stringify({ _id: teamString }
    function create_catch_block_1$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1$2.name,
    		type: "catch",
    		source: "(1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch(\\\"/teams/edit\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: teamString }",
    		ctx
    	});

    	return block;
    }

    // (44:59)            {#await turnTeamIDToTeamName(match.away) then away}
    function create_then_block_1$2(ctx) {
    	let t;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_2$2,
    		then: create_then_block_2$2,
    		catch: create_catch_block$2,
    		value: 9
    	};

    	handle_promise(turnTeamIDToTeamName$1(/*match*/ ctx[5].away), info);

    	const block = {
    		c: function create() {
    			info.block.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t.parentNode;
    			info.anchor = t;
    			insert_dev(target, t, anchor);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1$2.name,
    		type: "then",
    		source: "(44:59)            {#await turnTeamIDToTeamName(match.away) then away}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch("/teams/edit", {       method: "POST",       body: JSON.stringify({ _id: teamString }
    function create_catch_block$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch(\\\"/teams/edit\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: teamString }",
    		ctx
    	});

    	return block;
    }

    // (45:61)              <div>               <h1>{match.results}
    function create_then_block_2$2(ctx) {
    	let div;
    	let h1;
    	let t0_value = /*match*/ ctx[5].results + "";
    	let t0;
    	let t1;
    	let p;
    	let strong0;
    	let t2_value = /*home*/ ctx[8] + "";
    	let t2;
    	let t3;
    	let strong1;
    	let t4_value = /*away*/ ctx[9] + "";
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			strong0 = element("strong");
    			t2 = text(t2_value);
    			t3 = text(" played against ");
    			strong1 = element("strong");
    			t4 = text(t4_value);
    			add_location(h1, file$3, 46, 14, 1274);
    			add_location(strong0, file$3, 48, 16, 1333);
    			add_location(strong1, file$3, 48, 55, 1372);
    			add_location(p, file$3, 47, 14, 1313);
    			add_location(div, file$3, 45, 12, 1254);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, strong0);
    			append_dev(strong0, t2);
    			append_dev(p, t3);
    			append_dev(p, strong1);
    			append_dev(strong1, t4);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_2$2.name,
    		type: "then",
    		source: "(45:61)              <div>               <h1>{match.results}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch("/teams/edit", {       method: "POST",       body: JSON.stringify({ _id: teamString }
    function create_pending_block_2$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_2$2.name,
    		type: "pending",
    		source: "(1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch(\\\"/teams/edit\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: teamString }",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch("/teams/edit", {       method: "POST",       body: JSON.stringify({ _id: teamString }
    function create_pending_block_1$2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1$2.name,
    		type: "pending",
    		source: "(1:0) <script>   export let matchHistoryToggle = false;   export let correctUsername;    async function turnTeamIDToTeamName(teamString) {     let res = await fetch(\\\"/teams/edit\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: teamString }",
    		ctx
    	});

    	return block;
    }

    // (43:6) {#each matchHistory as match}
    function create_each_block$2(ctx) {
    	let await_block_anchor;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_1$2,
    		then: create_then_block_1$2,
    		catch: create_catch_block_1$2,
    		value: 8
    	};

    	handle_promise(turnTeamIDToTeamName$1(/*match*/ ctx[5].home), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(43:6) {#each matchHistory as match}",
    		ctx
    	});

    	return block;
    }

    // (40:32)        <p>Loading...</p>     {:then matchHistory}
    function create_pending_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$3, 40, 6, 1041);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(40:32)        <p>Loading...</p>     {:then matchHistory}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let if_block = /*matchHistoryToggle*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*matchHistoryToggle*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    async function turnTeamIDToTeamName$1(teamString) {
    	let res = await fetch("/teams/edit", {
    		method: "POST",
    		body: JSON.stringify({ _id: teamString }),
    		headers: { "content-type": "application/json" }
    	});

    	let json = await res.json();
    	return await json[0].name;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MatchHistory', slots, []);
    	let { matchHistoryToggle = false } = $$props;
    	let { correctUsername } = $$props;

    	const fetchMatchHistory = async () => {
    		let response = await fetch("/teams/match-history", {
    			method: "POST",
    			body: JSON.stringify({ teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		let data = await response.json();
    		let combined = [...data.winning, ...data.losing];

    		combined.sort((a, b) => {
    			return a.datetime - b.datetime;
    		});

    		return combined;
    	};

    	const writable_props = ['matchHistoryToggle', 'correctUsername'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MatchHistory> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, matchHistoryToggle = false);
    	};

    	$$self.$$set = $$props => {
    		if ('matchHistoryToggle' in $$props) $$invalidate(0, matchHistoryToggle = $$props.matchHistoryToggle);
    		if ('correctUsername' in $$props) $$invalidate(2, correctUsername = $$props.correctUsername);
    	};

    	$$self.$capture_state = () => ({
    		matchHistoryToggle,
    		correctUsername,
    		turnTeamIDToTeamName: turnTeamIDToTeamName$1,
    		fetchMatchHistory
    	});

    	$$self.$inject_state = $$props => {
    		if ('matchHistoryToggle' in $$props) $$invalidate(0, matchHistoryToggle = $$props.matchHistoryToggle);
    		if ('correctUsername' in $$props) $$invalidate(2, correctUsername = $$props.correctUsername);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [matchHistoryToggle, fetchMatchHistory, correctUsername, click_handler];
    }

    class MatchHistory extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			matchHistoryToggle: 0,
    			correctUsername: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MatchHistory",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*correctUsername*/ ctx[2] === undefined && !('correctUsername' in props)) {
    			console.warn("<MatchHistory> was created without expected prop 'correctUsername'");
    		}
    	}

    	get matchHistoryToggle() {
    		throw new Error("<MatchHistory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set matchHistoryToggle(value) {
    		throw new Error("<MatchHistory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get correctUsername() {
    		throw new Error("<MatchHistory>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set correctUsername(value) {
    		throw new Error("<MatchHistory>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/OtherTeams.svelte generated by Svelte v3.47.0 */

    const { console: console_1$2 } = globals;
    const file$2 = "src/OtherTeams.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[28] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[27] = list[i];
    	return child_ctx;
    }

    // (292:0) {#if loggedInOthers}
    function create_if_block_2$1(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let h1;
    	let t2;
    	let promise_1;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_3$1,
    		then: create_then_block_3$1,
    		catch: create_catch_block_4$1,
    		value: 27,
    		error: 31
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Other Teams:";
    			t2 = space();
    			info.block.c();
    			attr_dev(div0, "class", "backdrop svelte-1lu1rh");
    			add_location(div0, file$2, 292, 2, 6799);
    			add_location(h1, file$2, 299, 4, 6915);
    			attr_dev(div1, "class", "modal svelte-1lu1rh");
    			add_location(div1, file$2, 298, 2, 6891);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			info.block.m(div1, info.anchor = null);
    			info.mount = () => div1;
    			info.anchor = null;

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*promise*/ 4 && promise_1 !== (promise_1 = /*promise*/ ctx[2]) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(292:0) {#if loggedInOthers}",
    		ctx
    	});

    	return block;
    }

    // (327:4) {:catch error}
    function create_catch_block_4$1(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[31].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$2, 327, 6, 7611);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*promise*/ 4 && t_value !== (t_value = /*error*/ ctx[31].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_4$1.name,
    		type: "catch",
    		source: "(327:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (303:4) {:then user}
    function create_then_block_3$1(ctx) {
    	let each_1_anchor;
    	let each_value_2 = /*user*/ ctx[27];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*fetchWinrate, promise, individualTeam, loggedInOthers, currentId*/ 535) {
    				each_value_2 = /*user*/ ctx[27];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_3$1.name,
    		type: "then",
    		source: "(303:4) {:then user}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_catch_block_3$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_3$1.name,
    		type: "catch",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (317:54)              Winrate:             {#if winrate}
    function create_then_block_4$1(ctx) {
    	let t;
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*winrate*/ ctx[34]) return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			t = text("Winrate:\n            ");
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
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
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_4$1.name,
    		type: "then",
    		source: "(317:54)              Winrate:             {#if winrate}",
    		ctx
    	});

    	return block;
    }

    // (321:12) {:else}
    function create_else_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "0%";
    			add_location(p, file$2, 321, 14, 7510);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(321:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (319:12) {#if winrate}
    function create_if_block_3(ctx) {
    	let t0_value = /*winrate*/ ctx[34] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text("%");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*promise*/ 4 && t0_value !== (t0_value = /*winrate*/ ctx[34] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(319:12) {#if winrate}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_pending_block_4$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_4$1.name,
    		type: "pending",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (304:6) {#each user as user}
    function create_each_block_2(ctx) {
    	let div;
    	let h4;
    	let t0_value = /*user*/ ctx[27].name + "";
    	let t0;
    	let t1;
    	let t2_value = /*user*/ ctx[27].abb + "";
    	let t2;
    	let t3;
    	let t4;
    	let promise_1;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[15](/*user*/ ctx[27]);
    	}

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_4$1,
    		then: create_then_block_4$1,
    		catch: create_catch_block_3$1,
    		value: 34
    	};

    	handle_promise(promise_1 = /*fetchWinrate*/ ctx[9](/*user*/ ctx[27]._id), info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = text("[");
    			t2 = text(t2_value);
    			t3 = text("]");
    			t4 = space();
    			info.block.c();
    			t5 = space();
    			attr_dev(h4, "class", "team");
    			add_location(h4, file$2, 305, 10, 7067);
    			attr_dev(div, "class", "eachteam svelte-1lu1rh");
    			add_location(div, file$2, 304, 8, 7034);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(h4, t1);
    			append_dev(h4, t2);
    			append_dev(h4, t3);
    			append_dev(div, t4);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = t5;
    			append_dev(div, t5);

    			if (!mounted) {
    				dispose = listen_dev(h4, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*promise*/ 4 && t0_value !== (t0_value = /*user*/ ctx[27].name + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*promise*/ 4 && t2_value !== (t2_value = /*user*/ ctx[27].abb + "")) set_data_dev(t2, t2_value);
    			info.ctx = ctx;

    			if (dirty[0] & /*promise*/ 4 && promise_1 !== (promise_1 = /*fetchWinrate*/ ctx[9](/*user*/ ctx[27]._id)) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(304:6) {#each user as user}",
    		ctx
    	});

    	return block;
    }

    // (301:20)        <p>Loading...</p>     {:then user}
    function create_pending_block_3$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$2, 301, 6, 6964);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_3$1.name,
    		type: "pending",
    		source: "(301:20)        <p>Loading...</p>     {:then user}",
    		ctx
    	});

    	return block;
    }

    // (333:0) {#if individualTeam}
    function create_if_block$1(ctx) {
    	let div0;
    	let t0;
    	let div2;
    	let promise_1;
    	let t1;
    	let div1;
    	let h3;
    	let t3;
    	let form;
    	let input0;
    	let t4;
    	let input1;
    	let t5;
    	let select;
    	let t6;
    	let input2;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_1$1,
    		then: create_then_block_1$1,
    		catch: create_catch_block_2$1,
    		value: 27,
    		error: 31
    	};

    	handle_promise(promise_1 = /*teamPromise*/ ctx[3], info);

    	let info_1 = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 23
    	};

    	handle_promise(/*listMyTeams*/ ctx[11](), info_1);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			info.block.c();
    			t1 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Schedule a scrim!";
    			t3 = space();
    			form = element("form");
    			input0 = element("input");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			select = element("select");
    			info_1.block.c();
    			t6 = space();
    			input2 = element("input");
    			attr_dev(div0, "class", "backdrop svelte-1lu1rh");
    			add_location(div0, file$2, 333, 2, 7705);
    			add_location(h3, file$2, 378, 6, 9032);
    			attr_dev(input0, "type", "date");
    			add_location(input0, file$2, 380, 8, 9105);
    			attr_dev(input1, "type", "time");
    			add_location(input1, file$2, 381, 8, 9153);
    			attr_dev(select, "id", "teamSelect");
    			if (/*homeTeam*/ ctx[7] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[19].call(select));
    			add_location(select, file$2, 382, 8, 9201);
    			attr_dev(input2, "type", "submit");
    			input2.value = "Invite";
    			add_location(input2, file$2, 391, 8, 9492);
    			attr_dev(form, "action", "#");
    			attr_dev(form, "method", "post");
    			add_location(form, file$2, 379, 6, 9065);
    			add_location(div1, file$2, 377, 4, 9020);
    			attr_dev(div2, "class", "modal svelte-1lu1rh");
    			add_location(div2, file$2, 339, 2, 7797);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			info.block.m(div2, info.anchor = null);
    			info.mount = () => div2;
    			info.anchor = t1;
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(div1, t3);
    			append_dev(div1, form);
    			append_dev(form, input0);
    			set_input_value(input0, /*date*/ ctx[6]);
    			append_dev(form, t4);
    			append_dev(form, input1);
    			set_input_value(input1, /*time*/ ctx[5]);
    			append_dev(form, t5);
    			append_dev(form, select);
    			info_1.block.m(select, info_1.anchor = null);
    			info_1.mount = () => select;
    			info_1.anchor = null;
    			select_option(select, /*homeTeam*/ ctx[7]);
    			append_dev(form, t6);
    			append_dev(form, input2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler_2*/ ctx[16], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[17]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[18]),
    					listen_dev(select, "change", /*select_change_handler*/ ctx[19]),
    					listen_dev(input2, "click", /*click_handler_3*/ ctx[20], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty[0] & /*teamPromise*/ 8 && promise_1 !== (promise_1 = /*teamPromise*/ ctx[3]) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}

    			if (dirty[0] & /*date*/ 64) {
    				set_input_value(input0, /*date*/ ctx[6]);
    			}

    			if (dirty[0] & /*time*/ 32) {
    				set_input_value(input1, /*time*/ ctx[5]);
    			}

    			update_await_block_branch(info_1, ctx, dirty);

    			if (dirty[0] & /*homeTeam, listMyTeams*/ 2176) {
    				select_option(select, /*homeTeam*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			info.block.d();
    			info.token = null;
    			info = null;
    			info_1.block.d();
    			info_1.token = null;
    			info_1 = null;
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(333:0) {#if individualTeam}",
    		ctx
    	});

    	return block;
    }

    // (374:4) {:catch error}
    function create_catch_block_2$1(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[31].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$2, 374, 6, 8960);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*teamPromise*/ 8 && t_value !== (t_value = /*error*/ ctx[31].message + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_2$1.name,
    		type: "catch",
    		source: "(374:4) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (343:4) {:then user}
    function create_then_block_1$1(ctx) {
    	let h1;
    	let t0_value = /*user*/ ctx[27][0].name + "";
    	let t0;
    	let t1;
    	let div;
    	let each_value_1 = /*user*/ ctx[27][0].members;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$2, 343, 6, 7889);
    			attr_dev(div, "class", "whole-team svelte-1lu1rh");
    			add_location(div, file$2, 344, 6, 7919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*teamPromise*/ 8 && t0_value !== (t0_value = /*user*/ ctx[27][0].name + "")) set_data_dev(t0, t0_value);

    			if (dirty[0] & /*fetchRank, teamPromise, champions*/ 1288) {
    				each_value_1 = /*user*/ ctx[27][0].members;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1$1.name,
    		type: "then",
    		source: "(343:4) {:then user}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_catch_block_1$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1$1.name,
    		type: "catch",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (351:12) {:then data}
    function create_then_block_2$1(ctx) {
    	let div0;
    	let t0_value = /*data*/ ctx[23].rank + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*champions*/ ctx[8][/*data*/ ctx[23].mostPlayed] + "";
    	let t2;
    	let t3;
    	let if_block = /*champions*/ ctx[8][/*data*/ ctx[23].mostPlayed] !== "Does not play a champion :(" && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "rank svelte-1lu1rh");
    			add_location(div0, file$2, 355, 14, 8307);
    			attr_dev(div1, "class", "most-played svelte-1lu1rh");
    			add_location(div1, file$2, 356, 14, 8357);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*teamPromise*/ 8 && t0_value !== (t0_value = /*data*/ ctx[23].rank + "")) set_data_dev(t0, t0_value);
    			if (dirty[0] & /*teamPromise*/ 8 && t2_value !== (t2_value = /*champions*/ ctx[8][/*data*/ ctx[23].mostPlayed] + "")) set_data_dev(t2, t2_value);

    			if (/*champions*/ ctx[8][/*data*/ ctx[23].mostPlayed] !== "Does not play a champion :(") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_2$1.name,
    		type: "then",
    		source: "(351:12) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (359:16) {#if champions[data.mostPlayed] !== "Does not play a champion :("}
    function create_if_block_1$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + /*champions*/ ctx[8][/*data*/ ctx[23].mostPlayed] + "_0.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "championMostPlayed");
    			attr_dev(img, "class", "championIcon svelte-1lu1rh");
    			add_location(img, file$2, 359, 18, 8529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*teamPromise*/ 8 && !src_url_equal(img.src, img_src_value = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + /*champions*/ ctx[8][/*data*/ ctx[23].mostPlayed] + "_0.jpg")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(359:16) {#if champions[data.mostPlayed] !== \\\"Does not play a champion :(\\\"}",
    		ctx
    	});

    	return block;
    }

    // (349:38)                <p>Loading...</p>             {:then data}
    function create_pending_block_2$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$2, 349, 14, 8115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_2$1.name,
    		type: "pending",
    		source: "(349:38)                <p>Loading...</p>             {:then data}",
    		ctx
    	});

    	return block;
    }

    // (346:8) {#each user[0].members as member}
    function create_each_block_1$1(ctx) {
    	let div1;
    	let div0;
    	let t0_value = /*member*/ ctx[28] + "";
    	let t0;
    	let t1;
    	let promise_1;
    	let t2;
    	let br;
    	let t3;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_2$1,
    		then: create_then_block_2$1,
    		catch: create_catch_block_1$1,
    		value: 23
    	};

    	handle_promise(promise_1 = /*fetchRank*/ ctx[10](/*member*/ ctx[28]), info);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			info.block.c();
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			attr_dev(div0, "class", "name svelte-1lu1rh");
    			add_location(div0, file$2, 347, 12, 8029);
    			add_location(br, file$2, 369, 12, 8882);
    			attr_dev(div1, "class", "member svelte-1lu1rh");
    			add_location(div1, file$2, 346, 10, 7996);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);
    			info.block.m(div1, info.anchor = null);
    			info.mount = () => div1;
    			info.anchor = t2;
    			append_dev(div1, t2);
    			append_dev(div1, br);
    			append_dev(div1, t3);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty[0] & /*teamPromise*/ 8 && t0_value !== (t0_value = /*member*/ ctx[28] + "")) set_data_dev(t0, t0_value);
    			info.ctx = ctx;

    			if (dirty[0] & /*teamPromise*/ 8 && promise_1 !== (promise_1 = /*fetchRank*/ ctx[10](/*member*/ ctx[28])) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(346:8) {#each user[0].members as member}",
    		ctx
    	});

    	return block;
    }

    // (341:24)        <p>Loading...</p>     {:then user}
    function create_pending_block_1$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$2, 341, 6, 7848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1$1.name,
    		type: "pending",
    		source: "(341:24)        <p>Loading...</p>     {:then user}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   //   import { onMount }
    function create_catch_block$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0) <script>   //   import { onMount }",
    		ctx
    	});

    	return block;
    }

    // (386:10) {:then data}
    function create_then_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*data*/ ctx[23];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*listMyTeams*/ 2048) {
    				each_value = /*data*/ ctx[23];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(386:10) {:then data}",
    		ctx
    	});

    	return block;
    }

    // (387:12) {#each data as team}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*team*/ ctx[24].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*team*/ ctx[24]._id;
    			option.value = option.__value;
    			add_location(option, file$2, 387, 14, 9381);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(387:12) {#each data as team}",
    		ctx
    	});

    	return block;
    }

    // (384:32)              <p>Loading...</p>           {:then data}
    function create_pending_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$2, 384, 12, 9293);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(384:32)              <p>Loading...</p>           {:then data}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let if_block1_anchor;
    	let if_block0 = /*loggedInOthers*/ ctx[0] && create_if_block_2$1(ctx);
    	let if_block1 = /*individualTeam*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*loggedInOthers*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*individualTeam*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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

    const riotAPIKey = "RGAPI-57941ee5-a1c7-42af-ac11-38bdaccc729c";

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('OtherTeams', slots, []);

    	const champions = {
    		0: "Does not play a champion :(",
    		266: "Aatrox",
    		103: "Ahri",
    		84: "Akali",
    		166: "Akshan",
    		12: "Alistar",
    		32: "Amumu",
    		34: "Anivia",
    		1: "Annie",
    		523: "Aphelios",
    		22: "Ashe",
    		136: "Aurelion Sol",
    		268: "Azir",
    		432: "Bard",
    		53: "Blitzcrank",
    		63: "Brand",
    		201: "Braum",
    		51: "Caitlyn",
    		164: "Camille",
    		69: "Cassiopeia",
    		31: "Cho'Gath",
    		42: "Corki",
    		122: "Darius",
    		131: "Diana",
    		119: "Draven",
    		36: "Dr. Mundo",
    		245: "Ekko",
    		60: "Elise",
    		28: "Evelynn",
    		81: "Ezreal",
    		9: "Fiddlesticks",
    		114: "Fiora",
    		105: "Fizz",
    		3: "Galio",
    		41: "Gangplank",
    		86: "Garen",
    		150: "Gnar",
    		79: "Gragas",
    		104: "Graves",
    		887: "Gwen",
    		120: "Hecarim",
    		74: "Heimerdinger",
    		420: "Illaoi",
    		39: "Irelia",
    		427: "Ivern",
    		40: "Janna",
    		59: "Jarvan IV",
    		24: "Jax",
    		126: "Jayce",
    		202: "Jhin",
    		222: "Jinx",
    		145: "Kai'Sa",
    		429: "Kalista",
    		43: "Karma",
    		30: "Karthus",
    		38: "Kassadin",
    		55: "Katarina",
    		10: "Kayle",
    		141: "Kayn",
    		85: "Kennen",
    		121: "Kha'Zix",
    		203: "Kindred",
    		240: "Kled",
    		96: "Kog'Maw",
    		7: "LeBlanc",
    		64: "Lee Sin",
    		89: "Leona",
    		876: "Lillia",
    		127: "Lissandra",
    		236: "Lucian",
    		117: "Lulu",
    		99: "Lux",
    		54: "Malphite",
    		90: "Malzahar",
    		57: "Maokai",
    		11: "Master Yi",
    		21: "Miss Fortune",
    		62: "Wukong",
    		82: "Mordekaiser",
    		25: "Morgana",
    		267: "Nami",
    		75: "Nasus",
    		111: "Nautilus",
    		518: "Neeko",
    		76: "Nidalee",
    		56: "Nocturne",
    		20: "Nunu & Willump",
    		2: "Olaf",
    		61: "Orianna",
    		516: "Ornn",
    		80: "Pantheon",
    		78: "Poppy",
    		555: "Pyke",
    		246: "Qiyana",
    		133: "Quinn",
    		497: "Rakan",
    		33: "Rammus",
    		421: "Rek'Sai",
    		526: "Rell",
    		888: "Renata Glasc",
    		58: "Renekton",
    		107: "Rengar",
    		92: "Riven",
    		68: "Rumble",
    		13: "Ryze",
    		360: "Samira",
    		113: "Sejuani",
    		235: "Senna",
    		147: "Seraphine",
    		875: "Sett",
    		35: "Shaco",
    		98: "Shen",
    		102: "Shyvana",
    		27: "Singed",
    		14: "Sion",
    		15: "Sivir",
    		72: "Skarner",
    		37: "Sona",
    		16: "Soraka",
    		50: "Swain",
    		517: "Sylas",
    		134: "Syndra",
    		223: "Tahm Kench",
    		163: "Taliyah",
    		91: "Talon",
    		44: "Taric",
    		17: "Teemo",
    		412: "Thresh",
    		18: "Tristana",
    		48: "Trundle",
    		23: "Tryndamere",
    		4: "Twisted Fate",
    		29: "Twitch",
    		77: "Udyr",
    		6: "Urgot",
    		110: "Varus",
    		67: "Vayne",
    		45: "Veigar",
    		161: "Vel'Koz",
    		711: "Vex",
    		254: "Vi",
    		234: "Viego",
    		112: "Viktor",
    		8: "Vladimir",
    		106: "Volibear",
    		19: "Warwick",
    		498: "Xayah",
    		101: "Xerath",
    		5: "Xin Zhao",
    		157: "Yasuo",
    		777: "Yone",
    		83: "Yorick",
    		350: "Yuumi",
    		154: "Zac",
    		238: "Zed",
    		221: "Zeri",
    		115: "Ziggs",
    		26: "Zilean",
    		142: "Zoe",
    		143: "Zyra"
    	};

    	let { loggedInOthers = false } = $$props;
    	let { correctUsername = "" } = $$props;
    	let individualTeam = false;
    	let promise;
    	let teamPromise;
    	let currentId;
    	let time;
    	let date;
    	let homeTeam = "sadness";

    	const fetchWinrate = async teamID => {
    		let response = await fetch("/teams/winrate", {
    			method: "POST",
    			body: JSON.stringify({ _id: teamID }),
    			headers: { "content-type": "application/json" }
    		});

    		let data = await response.json();
    		let winrate = await data.winrate;
    		return await winrate * 100;
    	};

    	const fetchRank = async summonerName => {
    		let playerData = {};

    		let response1 = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${riotAPIKey}`, {
    			method: "GET",
    			headers: { "content-type": "application/json" }
    		});

    		let data1 = await response1.json();
    		const accountId = await data1.id;
    		let response2 = await fetch(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${accountId}?api_key=${riotAPIKey}`);
    		let data2 = await response2.json();
    		console.log(await data2);

    		if ((await data2).length === 0) {
    			playerData["rank"] = "Unranked";
    		} else {
    			console.log("dont help");
    			playerData["rank"] = await data2[0].tier + " " + await data2[0].rank;
    		}

    		let response3 = await fetch(`https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${accountId}?api_key=${riotAPIKey}`);
    		let data3 = await response3.json();

    		if ((await data3).length === 0) {
    			playerData["mostPlayed"] = 0;
    		} else {
    			let allPlayed = await data3;
    			let max = 0;

    			await allPlayed.forEach(champion => {
    				if (champion.championPoints >= max) {
    					max = champion.championPoints;
    					playerData["mostPlayed"] = champion.championId;
    				}
    			});
    		}

    		console.log(await playerData);
    		return await playerData;
    	};

    	const listMyTeams = async () => {
    		let res = await fetch("/teams/list", {
    			method: "POST",
    			body: JSON.stringify({ teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	const listTeams = async () => {
    		let res = await fetch("/teams/others", {
    			method: "POST",
    			body: JSON.stringify({ teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	const listTeammates = async () => {
    		let res = await fetch("/teams/edit", {
    			method: "POST",
    			body: JSON.stringify({ _id: currentId }),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	const eventInvite = () => {
    		let dateStr = date + "T" + time + ":00";
    		let datetime = new Date(dateStr);
    		let unixTime = Math.floor(datetime.getTime() / 1000);
    		let currentdate = new Date();
    		let currentUnixTime = Math.floor(currentdate.getTime() / 1000);

    		if (unixTime < currentUnixTime) {
    			alert("Select a time in the future");
    			return;
    		}

    		const data = {
    			home: document.getElementById("teamSelect").value,
    			datetime: unixTime,
    			away: currentId,
    			accepted: false,
    			markAsRead: false
    		};

    		console.log(homeTeam);

    		fetch("/teams/new-event", {
    			method: "POST",
    			body: JSON.stringify(data),
    			headers: { "content-type": "application/json" }
    		});
    	};

    	const writable_props = ['loggedInOthers', 'correctUsername'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<OtherTeams> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, loggedInOthers = false);
    	};

    	const click_handler_1 = user => {
    		console.log(user);
    		$$invalidate(1, individualTeam = true);
    		$$invalidate(0, loggedInOthers = false);
    		$$invalidate(4, currentId = user._id);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(1, individualTeam = false);
    	};

    	function input0_input_handler() {
    		date = this.value;
    		$$invalidate(6, date);
    	}

    	function input1_input_handler() {
    		time = this.value;
    		$$invalidate(5, time);
    	}

    	function select_change_handler() {
    		homeTeam = select_value(this);
    		$$invalidate(7, homeTeam);
    		$$invalidate(11, listMyTeams);
    	}

    	const click_handler_3 = event => {
    		event.preventDefault();
    		eventInvite();
    	};

    	$$self.$$set = $$props => {
    		if ('loggedInOthers' in $$props) $$invalidate(0, loggedInOthers = $$props.loggedInOthers);
    		if ('correctUsername' in $$props) $$invalidate(13, correctUsername = $$props.correctUsername);
    	};

    	$$self.$capture_state = () => ({
    		champions,
    		loggedInOthers,
    		correctUsername,
    		individualTeam,
    		promise,
    		teamPromise,
    		currentId,
    		riotAPIKey,
    		time,
    		date,
    		homeTeam,
    		fetchWinrate,
    		fetchRank,
    		listMyTeams,
    		listTeams,
    		listTeammates,
    		eventInvite
    	});

    	$$self.$inject_state = $$props => {
    		if ('loggedInOthers' in $$props) $$invalidate(0, loggedInOthers = $$props.loggedInOthers);
    		if ('correctUsername' in $$props) $$invalidate(13, correctUsername = $$props.correctUsername);
    		if ('individualTeam' in $$props) $$invalidate(1, individualTeam = $$props.individualTeam);
    		if ('promise' in $$props) $$invalidate(2, promise = $$props.promise);
    		if ('teamPromise' in $$props) $$invalidate(3, teamPromise = $$props.teamPromise);
    		if ('currentId' in $$props) $$invalidate(4, currentId = $$props.currentId);
    		if ('time' in $$props) $$invalidate(5, time = $$props.time);
    		if ('date' in $$props) $$invalidate(6, date = $$props.date);
    		if ('homeTeam' in $$props) $$invalidate(7, homeTeam = $$props.homeTeam);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*loggedInOthers*/ 1) {
    			if (loggedInOthers) {
    				$$invalidate(2, promise = listTeams());
    			}
    		}

    		if ($$self.$$.dirty[0] & /*individualTeam*/ 2) {
    			if (individualTeam) {
    				$$invalidate(3, teamPromise = listTeammates());
    			}
    		}
    	};

    	return [
    		loggedInOthers,
    		individualTeam,
    		promise,
    		teamPromise,
    		currentId,
    		time,
    		date,
    		homeTeam,
    		champions,
    		fetchWinrate,
    		fetchRank,
    		listMyTeams,
    		eventInvite,
    		correctUsername,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		input0_input_handler,
    		input1_input_handler,
    		select_change_handler,
    		click_handler_3
    	];
    }

    class OtherTeams extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { loggedInOthers: 0, correctUsername: 13 }, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "OtherTeams",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get loggedInOthers() {
    		throw new Error("<OtherTeams>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loggedInOthers(value) {
    		throw new Error("<OtherTeams>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get correctUsername() {
    		throw new Error("<OtherTeams>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set correctUsername(value) {
    		throw new Error("<OtherTeams>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Notifications.svelte generated by Svelte v3.47.0 */

    const { console: console_1$1 } = globals;
    const file$1 = "src/Notifications.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (183:0) {#if loggedIn}
    function create_if_block(ctx) {
    	let if_block_anchor;
    	let if_block = /*notificationsToggle*/ ctx[1] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*notificationsToggle*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(183:0) {#if loggedIn}",
    		ctx
    	});

    	return block;
    }

    // (184:2) {#if notificationsToggle}
    function create_if_block_1(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let div2;
    	let h1;
    	let t3;
    	let t4;
    	let div1;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_4,
    		then: create_then_block_4,
    		catch: create_catch_block_4,
    		value: 28
    	};

    	handle_promise(/*loadNotifications*/ ctx[7](), info);

    	let info_1 = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block_1,
    		then: create_then_block_1,
    		catch: create_catch_block_3,
    		value: 21,
    		error: 27
    	};

    	handle_promise(/*pendingNotifications*/ ctx[8](), info_1);
    	let each_value = /*currentNotificationsList*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			info.block.c();
    			t1 = space();
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Your Notifications";
    			t3 = space();
    			info_1.block.c();
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "backdrop svelte-zfr8kd");
    			add_location(div0, file$1, 184, 4, 4997);
    			add_location(h1, file$1, 192, 6, 5203);
    			add_location(div1, file$1, 224, 6, 6158);
    			attr_dev(div2, "class", "notifications modal svelte-zfr8kd");
    			add_location(div2, file$1, 191, 4, 5163);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t1.parentNode;
    			info.anchor = t1;
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t3);
    			info_1.block.m(div2, info_1.anchor = null);
    			info_1.mount = () => div2;
    			info_1.anchor = t4;
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*click_handler*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    			update_await_block_branch(info_1, ctx, dirty);

    			if (dirty & /*turnTeamIDToTeamName, currentNotificationsList, markAsRead*/ 12) {
    				each_value = /*currentNotificationsList*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			info_1.block.d();
    			info_1.token = null;
    			info_1 = null;
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(184:2) {#if notificationsToggle}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = "TSM";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch("/teams/mark-as-read", {       method: "POST",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }
    function create_catch_block_4(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_4.name,
    		type: "catch",
    		source: "(1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = \\\"TSM\\\";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch(\\\"/teams/mark-as-read\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }",
    		ctx
    	});

    	return block;
    }

    // (191:42) {info}
    function create_then_block_4(ctx) {
    	let t_value = /*info*/ ctx[28] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_4.name,
    		type: "then",
    		source: "(191:42) {info}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = "TSM";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch("/teams/mark-as-read", {       method: "POST",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }
    function create_pending_block_4(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_4.name,
    		type: "pending",
    		source: "(1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = \\\"TSM\\\";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch(\\\"/teams/mark-as-read\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }",
    		ctx
    	});

    	return block;
    }

    // (221:6) {:catch error}
    function create_catch_block_3(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[27].message + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			set_style(p, "color", "red");
    			add_location(p, file$1, 221, 8, 6094);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_3.name,
    		type: "catch",
    		source: "(221:6) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (196:6) {:then notifications}
    function create_then_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*notifications*/ ctx[21];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*turnTeamIDToTeamName, pendingNotifications, declineScrim, acceptScrim, dataDate*/ 368) {
    				each_value_1 = /*notifications*/ ctx[21];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_1.name,
    		type: "then",
    		source: "(196:6) {:then notifications}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = "TSM";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch("/teams/mark-as-read", {       method: "POST",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }
    function create_catch_block_2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_2.name,
    		type: "catch",
    		source: "(1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = \\\"TSM\\\";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch(\\\"/teams/mark-as-read\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }",
    		ctx
    	});

    	return block;
    }

    // (198:75)              <p>               Your team:               {information}
    function create_then_block_3(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*information*/ ctx[26] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Your team:\n              ");
    			t1 = text(t1_value);
    			t2 = text(" vs");
    			add_location(p, file$1, 198, 12, 5457);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_3.name,
    		type: "then",
    		source: "(198:75)              <p>               Your team:               {information}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = "TSM";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch("/teams/mark-as-read", {       method: "POST",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }
    function create_pending_block_3(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_3.name,
    		type: "pending",
    		source: "(1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = \\\"TSM\\\";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch(\\\"/teams/mark-as-read\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = "TSM";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch("/teams/mark-as-read", {       method: "POST",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }
    function create_catch_block_1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block_1.name,
    		type: "catch",
    		source: "(1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = \\\"TSM\\\";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch(\\\"/teams/mark-as-read\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }",
    		ctx
    	});

    	return block;
    }

    // (203:68)              <div>               {data}
    function create_then_block_2(ctx) {
    	let div;
    	let t0_value = /*data*/ ctx[25] + "";
    	let t0;
    	let t1;
    	let t2_value = /*dataDate*/ ctx[4](/*notification*/ ctx[22].datetime) + "";
    	let t2;
    	let t3;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[12](/*notification*/ ctx[22]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[13](/*notification*/ ctx[22]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			button0 = element("button");
    			button0.textContent = "Accept";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "Decline";
    			t7 = space();
    			add_location(button0, file$1, 207, 14, 5713);
    			add_location(button1, file$1, 212, 14, 5868);
    			add_location(div, file$1, 203, 12, 5623);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			append_dev(div, t3);
    			append_dev(div, button0);
    			append_dev(div, t5);
    			append_dev(div, button1);
    			insert_dev(target, t7, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler_1, false, false, false),
    					listen_dev(button1, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block_2.name,
    		type: "then",
    		source: "(203:68)              <div>               {data}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = "TSM";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch("/teams/mark-as-read", {       method: "POST",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }
    function create_pending_block_2(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_2.name,
    		type: "pending",
    		source: "(1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = \\\"TSM\\\";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch(\\\"/teams/mark-as-read\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }",
    		ctx
    	});

    	return block;
    }

    // (197:8) {#each notifications as notification}
    function create_each_block_1(ctx) {
    	let t;
    	let await_block1_anchor;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_3,
    		then: create_then_block_3,
    		catch: create_catch_block_2,
    		value: 26
    	};

    	handle_promise(turnTeamIDToTeamName(/*notification*/ ctx[22].away), info);

    	let info_1 = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block_2,
    		then: create_then_block_2,
    		catch: create_catch_block_1,
    		value: 25
    	};

    	handle_promise(turnTeamIDToTeamName(/*notification*/ ctx[22].home), info_1);

    	const block = {
    		c: function create() {
    			info.block.c();
    			t = space();
    			await_block1_anchor = empty();
    			info_1.block.c();
    		},
    		m: function mount(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t.parentNode;
    			info.anchor = t;
    			insert_dev(target, t, anchor);
    			insert_dev(target, await_block1_anchor, anchor);
    			info_1.block.m(target, info_1.anchor = anchor);
    			info_1.mount = () => await_block1_anchor.parentNode;
    			info_1.anchor = await_block1_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			update_await_block_branch(info, ctx, dirty);
    			update_await_block_branch(info_1, ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(await_block1_anchor);
    			info_1.block.d(detaching);
    			info_1.token = null;
    			info_1 = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(197:8) {#each notifications as notification}",
    		ctx
    	});

    	return block;
    }

    // (194:37)          <p>Loading...</p>       {:then notifications}
    function create_pending_block_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$1, 194, 8, 5277);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block_1.name,
    		type: "pending",
    		source: "(194:37)          <p>Loading...</p>       {:then notifications}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = "TSM";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch("/teams/mark-as-read", {       method: "POST",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = \\\"TSM\\\";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch(\\\"/teams/mark-as-read\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }",
    		ctx
    	});

    	return block;
    }

    // (227:70)              {opposingName}
    function create_then_block(ctx) {
    	let t0_value = /*opposingName*/ ctx[20] + "";
    	let t0;
    	let t1;
    	let t2;
    	let if_block = !/*scrim*/ ctx[17].markAsRead && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t2, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentNotificationsList*/ 4 && t0_value !== (t0_value = /*opposingName*/ ctx[20] + "")) set_data_dev(t0, t0_value);

    			if (!/*scrim*/ ctx[17].markAsRead) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(t2.parentNode, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(227:70)              {opposingName}",
    		ctx
    	});

    	return block;
    }

    // (229:12) {#if !scrim.markAsRead}
    function create_if_block_2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	function click_handler_3() {
    		return /*click_handler_3*/ ctx[14](/*scrim*/ ctx[17]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "MARK READY";
    			add_location(button, file$1, 229, 14, 6362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_3, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(229:12) {#if !scrim.markAsRead}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = "TSM";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch("/teams/mark-as-read", {       method: "POST",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>   export let correctUsername;   export let loggedIn;   export let notificationsToggle = false;   let team = \\\"TSM\\\";   let currentNotifications = [];   $: currentNotificationsList = currentNotifications;    const markAsRead = async (id) => {     let promise = await fetch(\\\"/teams/mark-as-read\\\", {       method: \\\"POST\\\",       body: JSON.stringify({ _id: id, teamOwner: correctUsername }",
    		ctx
    	});

    	return block;
    }

    // (226:8) {#each currentNotificationsList as scrim}
    function create_each_block(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 20
    	};

    	handle_promise(promise = turnTeamIDToTeamName(/*scrim*/ ctx[17].oppID), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*currentNotificationsList*/ 4 && promise !== (promise = turnTeamIDToTeamName(/*scrim*/ ctx[17].oppID)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(226:8) {#each currentNotificationsList as scrim}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*loggedIn*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*loggedIn*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    async function turnTeamIDToTeamName(teamString) {
    	let res = await fetch("/teams/edit", {
    		method: "POST",
    		body: JSON.stringify({ _id: teamString }),
    		headers: { "content-type": "application/json" }
    	});

    	let json = await res.json();
    	return await json[0].name;
    }

    //60000
    async function showNotification(notification) {
    	console.log("notifications are here");
    	let opposingTeam = await turnTeamIDToTeamName(notification.oppID);

    	new Notification("Your scrim is ready!",
    	{
    			body: "Your scrim against " + opposingTeam + " is ready"
    		});
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let currentNotificationsList;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Notifications', slots, []);
    	let { correctUsername } = $$props;
    	let { loggedIn } = $$props;
    	let { notificationsToggle = false } = $$props;
    	let team = "TSM";
    	let currentNotifications = [];

    	const markAsRead = async id => {
    		await fetch("/teams/mark-as-read", {
    			method: "POST",
    			body: JSON.stringify({ _id: id, teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		$$invalidate(0, loggedIn = false);

    		let timeout = new Promise(() => {
    				setTimeout(
    					() => {
    						$$invalidate(0, loggedIn = true);
    					},
    					15
    				);
    			});

    		timeout();
    	};

    	const dataDate = timestamp => {
    		var unixtimestamp = timestamp;

    		var months_arr = [
    			"Jan",
    			"Feb",
    			"Mar",
    			"Apr",
    			"May",
    			"Jun",
    			"Jul",
    			"Aug",
    			"Sep",
    			"Oct",
    			"Nov",
    			"Dec"
    		];

    		var date = new Date(unixtimestamp * 1000);
    		var year = date.getFullYear();
    		var month = months_arr[date.getMonth()];
    		var day = date.getDate();
    		var hours = "0" + date.getHours();
    		var minutes = "0" + date.getMinutes();

    		// Display date time in MM-dd-yyyy h:m:s format
    		var convdataTime = month + "-" + day + "-" + year + " " + hours.substr(-2) + ":" + minutes.substr(-2);

    		return convdataTime;
    	};

    	const acceptScrim = async id => {
    		await fetch("/teams/accepted-scrims", {
    			method: "POST",
    			body: JSON.stringify({ _id: id }),
    			headers: { "content-type": "application/json" }
    		});

    		$$invalidate(0, loggedIn = false);

    		let timeout = new Promise(() => {
    				setTimeout(
    					() => {
    						$$invalidate(0, loggedIn = true);
    					},
    					5
    				);
    			});

    		timeout();
    	};

    	const declineScrim = async id => {
    		await fetch("/teams/declined-scrims", {
    			method: "POST",
    			body: JSON.stringify({ _id: id }),
    			headers: { "content-type": "application/json" }
    		});

    		$$invalidate(0, loggedIn = false);

    		let timeout = new Promise(() => {
    				setTimeout(
    					() => {
    						$$invalidate(0, loggedIn = true);
    					},
    					5
    				);
    			});

    		timeout();
    	};

    	const loadNotifications = async () => {
    		let notificationPromise = await fetch("/teams/current-notifications", {
    			method: "POST",
    			body: JSON.stringify({ teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		$$invalidate(10, currentNotifications = await notificationPromise.json());
    		return "";
    	};

    	setInterval(
    		async function () {
    			loadNotifications();

    			// console.log(await turnTeamIDToTeamName("6266ff3a79a853413112c21f"));
    			//notifications
    			// fetch("/teams/notification").then((response) => {});
    			// if (Notification.permission === "granted") {
    			//   showNotification();
    			// } else if (Notification.permission !== "denied") {
    			//   Notification.requestPermission().then((permission) => {
    			//     if (permission === "granted") {
    			//       showNotification();
    			//     }
    			//   });
    			// }
    			if (currentNotifications.length !== 0) {
    				currentNotifications.forEach(notification => {
    					if (notification.markAsRead === false) {
    						if (Notification.permission === "granted") {
    							showNotification(notification);
    						} else if (Notification.permission !== "denied") {
    							Notification.requestPermission().then(permission => {
    								if (permission === "granted") {
    									showNotification(notification);
    								}
    							});
    						}
    					}
    				});
    			}

    			if (currentNotifications) console.log(currentNotifications);
    			console.log("60 seconds have passed");
    		},
    		4575
    	);

    	const pendingNotifications = async () => {
    		let res = await fetch("/teams/pending-scrims", {
    			method: "POST",
    			body: JSON.stringify({ teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	const listTeams = async () => {
    		let res = await fetch("/teams/list", {
    			method: "POST",
    			body: JSON.stringify({ teamOwner: correctUsername }),
    			headers: { "content-type": "application/json" }
    		});

    		return await res.json();
    	};

    	const writable_props = ['correctUsername', 'loggedIn', 'notificationsToggle'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Notifications> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(1, notificationsToggle = false);
    	};

    	const click_handler_1 = notification => {
    		acceptScrim(notification._id);
    	};

    	const click_handler_2 = notification => {
    		declineScrim(notification._id);
    	};

    	const click_handler_3 = scrim => {
    		markAsRead(scrim._id);
    	};

    	$$self.$$set = $$props => {
    		if ('correctUsername' in $$props) $$invalidate(9, correctUsername = $$props.correctUsername);
    		if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    		if ('notificationsToggle' in $$props) $$invalidate(1, notificationsToggle = $$props.notificationsToggle);
    	};

    	$$self.$capture_state = () => ({
    		correctUsername,
    		loggedIn,
    		notificationsToggle,
    		team,
    		currentNotifications,
    		markAsRead,
    		turnTeamIDToTeamName,
    		dataDate,
    		acceptScrim,
    		declineScrim,
    		loadNotifications,
    		showNotification,
    		pendingNotifications,
    		listTeams,
    		currentNotificationsList
    	});

    	$$self.$inject_state = $$props => {
    		if ('correctUsername' in $$props) $$invalidate(9, correctUsername = $$props.correctUsername);
    		if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    		if ('notificationsToggle' in $$props) $$invalidate(1, notificationsToggle = $$props.notificationsToggle);
    		if ('team' in $$props) team = $$props.team;
    		if ('currentNotifications' in $$props) $$invalidate(10, currentNotifications = $$props.currentNotifications);
    		if ('currentNotificationsList' in $$props) $$invalidate(2, currentNotificationsList = $$props.currentNotificationsList);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentNotifications*/ 1024) {
    			$$invalidate(2, currentNotificationsList = currentNotifications);
    		}
    	};

    	return [
    		loggedIn,
    		notificationsToggle,
    		currentNotificationsList,
    		markAsRead,
    		dataDate,
    		acceptScrim,
    		declineScrim,
    		loadNotifications,
    		pendingNotifications,
    		correctUsername,
    		currentNotifications,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Notifications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			correctUsername: 9,
    			loggedIn: 0,
    			notificationsToggle: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notifications",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*correctUsername*/ ctx[9] === undefined && !('correctUsername' in props)) {
    			console_1$1.warn("<Notifications> was created without expected prop 'correctUsername'");
    		}

    		if (/*loggedIn*/ ctx[0] === undefined && !('loggedIn' in props)) {
    			console_1$1.warn("<Notifications> was created without expected prop 'loggedIn'");
    		}
    	}

    	get correctUsername() {
    		throw new Error("<Notifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set correctUsername(value) {
    		throw new Error("<Notifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loggedIn() {
    		throw new Error("<Notifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loggedIn(value) {
    		throw new Error("<Notifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get notificationsToggle() {
    		throw new Error("<Notifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set notificationsToggle(value) {
    		throw new Error("<Notifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.47.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let ul;
    	let li0;
    	let button0;
    	let t4;
    	let li1;
    	let button1;
    	let t6;
    	let li2;
    	let button2;
    	let t8;
    	let li3;
    	let button3;
    	let t10;
    	let li4;
    	let button4;
    	let t12;
    	let modal;
    	let updating_correctUsername;
    	let updating_showLogin;
    	let updating_loggedIn;
    	let updating_showModal;
    	let t13;
    	let team;
    	let updating_teamEdit;
    	let updating_loggedIn_1;
    	let updating_correctUsername_1;
    	let updating_players;
    	let updating_teamName;
    	let updating_abb;
    	let updating__id;
    	let updating_updateTeamTrue;
    	let updating_clickedRegister;
    	let t14;
    	let otherteams;
    	let updating_loggedInOthers;
    	let updating_correctUsername_2;
    	let t15;
    	let notifications;
    	let updating_notificationsToggle;
    	let updating_loggedIn_2;
    	let updating_correctUsername_3;
    	let t16;
    	let matchhistory;
    	let updating_matchHistoryToggle;
    	let updating_correctUsername_4;
    	let t17;
    	let main;
    	let p;
    	let t18;
    	let current;
    	let mounted;
    	let dispose;

    	function modal_correctUsername_binding(value) {
    		/*modal_correctUsername_binding*/ ctx[20](value);
    	}

    	function modal_showLogin_binding(value) {
    		/*modal_showLogin_binding*/ ctx[21](value);
    	}

    	function modal_loggedIn_binding(value) {
    		/*modal_loggedIn_binding*/ ctx[22](value);
    	}

    	function modal_showModal_binding(value) {
    		/*modal_showModal_binding*/ ctx[23](value);
    	}

    	let modal_props = {};

    	if (/*correctUsername*/ ctx[1] !== void 0) {
    		modal_props.correctUsername = /*correctUsername*/ ctx[1];
    	}

    	if (/*showLogin*/ ctx[8] !== void 0) {
    		modal_props.showLogin = /*showLogin*/ ctx[8];
    	}

    	if (/*loggedIn*/ ctx[0] !== void 0) {
    		modal_props.loggedIn = /*loggedIn*/ ctx[0];
    	}

    	if (/*showModal*/ ctx[3] !== void 0) {
    		modal_props.showModal = /*showModal*/ ctx[3];
    	}

    	modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, 'correctUsername', modal_correctUsername_binding));
    	binding_callbacks.push(() => bind(modal, 'showLogin', modal_showLogin_binding));
    	binding_callbacks.push(() => bind(modal, 'loggedIn', modal_loggedIn_binding));
    	binding_callbacks.push(() => bind(modal, 'showModal', modal_showModal_binding));

    	function team_teamEdit_binding(value) {
    		/*team_teamEdit_binding*/ ctx[24](value);
    	}

    	function team_loggedIn_binding(value) {
    		/*team_loggedIn_binding*/ ctx[25](value);
    	}

    	function team_correctUsername_binding(value) {
    		/*team_correctUsername_binding*/ ctx[26](value);
    	}

    	function team_players_binding(value) {
    		/*team_players_binding*/ ctx[27](value);
    	}

    	function team_teamName_binding(value) {
    		/*team_teamName_binding*/ ctx[28](value);
    	}

    	function team_abb_binding(value) {
    		/*team_abb_binding*/ ctx[29](value);
    	}

    	function team__id_binding(value) {
    		/*team__id_binding*/ ctx[30](value);
    	}

    	function team_updateTeamTrue_binding(value) {
    		/*team_updateTeamTrue_binding*/ ctx[31](value);
    	}

    	function team_clickedRegister_binding(value) {
    		/*team_clickedRegister_binding*/ ctx[32](value);
    	}

    	let team_props = {};

    	if (/*teamEdit*/ ctx[4] !== void 0) {
    		team_props.teamEdit = /*teamEdit*/ ctx[4];
    	}

    	if (/*loggedIn*/ ctx[0] !== void 0) {
    		team_props.loggedIn = /*loggedIn*/ ctx[0];
    	}

    	if (/*correctUsername*/ ctx[1] !== void 0) {
    		team_props.correctUsername = /*correctUsername*/ ctx[1];
    	}

    	if (/*players*/ ctx[10] !== void 0) {
    		team_props.players = /*players*/ ctx[10];
    	}

    	if (/*teamName*/ ctx[11] !== void 0) {
    		team_props.teamName = /*teamName*/ ctx[11];
    	}

    	if (/*abb*/ ctx[12] !== void 0) {
    		team_props.abb = /*abb*/ ctx[12];
    	}

    	if (/*_id*/ ctx[13] !== void 0) {
    		team_props._id = /*_id*/ ctx[13];
    	}

    	if (/*updateTeamTrue*/ ctx[5] !== void 0) {
    		team_props.updateTeamTrue = /*updateTeamTrue*/ ctx[5];
    	}

    	if (/*clickedRegister*/ ctx[2] !== void 0) {
    		team_props.clickedRegister = /*clickedRegister*/ ctx[2];
    	}

    	team = new Team({ props: team_props, $$inline: true });
    	binding_callbacks.push(() => bind(team, 'teamEdit', team_teamEdit_binding));
    	binding_callbacks.push(() => bind(team, 'loggedIn', team_loggedIn_binding));
    	binding_callbacks.push(() => bind(team, 'correctUsername', team_correctUsername_binding));
    	binding_callbacks.push(() => bind(team, 'players', team_players_binding));
    	binding_callbacks.push(() => bind(team, 'teamName', team_teamName_binding));
    	binding_callbacks.push(() => bind(team, 'abb', team_abb_binding));
    	binding_callbacks.push(() => bind(team, '_id', team__id_binding));
    	binding_callbacks.push(() => bind(team, 'updateTeamTrue', team_updateTeamTrue_binding));
    	binding_callbacks.push(() => bind(team, 'clickedRegister', team_clickedRegister_binding));

    	function otherteams_loggedInOthers_binding(value) {
    		/*otherteams_loggedInOthers_binding*/ ctx[33](value);
    	}

    	function otherteams_correctUsername_binding(value) {
    		/*otherteams_correctUsername_binding*/ ctx[34](value);
    	}

    	let otherteams_props = {};

    	if (/*loggedInOthers*/ ctx[6] !== void 0) {
    		otherteams_props.loggedInOthers = /*loggedInOthers*/ ctx[6];
    	}

    	if (/*correctUsername*/ ctx[1] !== void 0) {
    		otherteams_props.correctUsername = /*correctUsername*/ ctx[1];
    	}

    	otherteams = new OtherTeams({ props: otherteams_props, $$inline: true });
    	binding_callbacks.push(() => bind(otherteams, 'loggedInOthers', otherteams_loggedInOthers_binding));
    	binding_callbacks.push(() => bind(otherteams, 'correctUsername', otherteams_correctUsername_binding));

    	function notifications_notificationsToggle_binding(value) {
    		/*notifications_notificationsToggle_binding*/ ctx[35](value);
    	}

    	function notifications_loggedIn_binding(value) {
    		/*notifications_loggedIn_binding*/ ctx[36](value);
    	}

    	function notifications_correctUsername_binding(value) {
    		/*notifications_correctUsername_binding*/ ctx[37](value);
    	}

    	let notifications_props = {};

    	if (/*notificationsToggle*/ ctx[7] !== void 0) {
    		notifications_props.notificationsToggle = /*notificationsToggle*/ ctx[7];
    	}

    	if (/*loggedIn*/ ctx[0] !== void 0) {
    		notifications_props.loggedIn = /*loggedIn*/ ctx[0];
    	}

    	if (/*correctUsername*/ ctx[1] !== void 0) {
    		notifications_props.correctUsername = /*correctUsername*/ ctx[1];
    	}

    	notifications = new Notifications({
    			props: notifications_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(notifications, 'notificationsToggle', notifications_notificationsToggle_binding));
    	binding_callbacks.push(() => bind(notifications, 'loggedIn', notifications_loggedIn_binding));
    	binding_callbacks.push(() => bind(notifications, 'correctUsername', notifications_correctUsername_binding));

    	function matchhistory_matchHistoryToggle_binding(value) {
    		/*matchhistory_matchHistoryToggle_binding*/ ctx[38](value);
    	}

    	function matchhistory_correctUsername_binding(value) {
    		/*matchhistory_correctUsername_binding*/ ctx[39](value);
    	}

    	let matchhistory_props = {};

    	if (/*matchHistoryToggle*/ ctx[9] !== void 0) {
    		matchhistory_props.matchHistoryToggle = /*matchHistoryToggle*/ ctx[9];
    	}

    	if (/*correctUsername*/ ctx[1] !== void 0) {
    		matchhistory_props.correctUsername = /*correctUsername*/ ctx[1];
    	}

    	matchhistory = new MatchHistory({
    			props: matchhistory_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(matchhistory, 'matchHistoryToggle', matchhistory_matchHistoryToggle_binding));
    	binding_callbacks.push(() => bind(matchhistory, 'correctUsername', matchhistory_correctUsername_binding));

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Eric's E-Team Management System";
    			t2 = space();
    			ul = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			button0.textContent = "Logout";
    			t4 = space();
    			li1 = element("li");
    			button1 = element("button");
    			button1.textContent = "Notifications";
    			t6 = space();
    			li2 = element("li");
    			button2 = element("button");
    			button2.textContent = "All Other Teams";
    			t8 = space();
    			li3 = element("li");
    			button3 = element("button");
    			button3.textContent = "Register Team!";
    			t10 = space();
    			li4 = element("li");
    			button4 = element("button");
    			button4.textContent = "Coach Match History";
    			t12 = space();
    			create_component(modal.$$.fragment);
    			t13 = space();
    			create_component(team.$$.fragment);
    			t14 = space();
    			create_component(otherteams.$$.fragment);
    			t15 = space();
    			create_component(notifications.$$.fragment);
    			t16 = space();
    			create_component(matchhistory.$$.fragment);
    			t17 = space();
    			main = element("main");
    			p = element("p");
    			t18 = text(/*output*/ ctx[14]);
    			if (!src_url_equal(img.src, img_src_value = "pictures/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "svelte-1pojn5t");
    			add_location(img, file, 36, 2, 928);
    			add_location(h1, file, 37, 2, 973);
    			attr_dev(button0, "class", "svelte-1pojn5t");
    			add_location(button0, file, 40, 6, 1056);
    			attr_dev(li0, "class", "svelte-1pojn5t");
    			add_location(li0, file, 39, 4, 1045);
    			attr_dev(button1, "class", "svelte-1pojn5t");
    			add_location(button1, file, 52, 6, 1281);
    			attr_dev(li1, "class", "svelte-1pojn5t");
    			add_location(li1, file, 51, 4, 1270);
    			attr_dev(button2, "class", "svelte-1pojn5t");
    			add_location(button2, file, 59, 6, 1419);
    			attr_dev(li2, "class", "svelte-1pojn5t");
    			add_location(li2, file, 58, 4, 1408);
    			attr_dev(button3, "class", "svelte-1pojn5t");
    			add_location(button3, file, 66, 6, 1554);
    			attr_dev(li3, "class", "svelte-1pojn5t");
    			add_location(li3, file, 65, 4, 1543);
    			attr_dev(button4, "class", "svelte-1pojn5t");
    			add_location(button4, file, 75, 6, 1738);
    			attr_dev(li4, "class", "svelte-1pojn5t");
    			add_location(li4, file, 74, 4, 1727);
    			attr_dev(ul, "class", "list-header svelte-1pojn5t");
    			add_location(ul, file, 38, 2, 1016);
    			attr_dev(nav, "class", "header nav svelte-1pojn5t");
    			add_location(nav, file, 35, 0, 901);
    			add_location(p, file, 102, 2, 2457);
    			add_location(main, file, 101, 0, 2448);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, img);
    			append_dev(nav, t0);
    			append_dev(nav, h1);
    			append_dev(nav, t2);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, button0);
    			append_dev(ul, t4);
    			append_dev(ul, li1);
    			append_dev(li1, button1);
    			append_dev(ul, t6);
    			append_dev(ul, li2);
    			append_dev(li2, button2);
    			append_dev(ul, t8);
    			append_dev(ul, li3);
    			append_dev(li3, button3);
    			append_dev(ul, t10);
    			append_dev(ul, li4);
    			append_dev(li4, button4);
    			insert_dev(target, t12, anchor);
    			mount_component(modal, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(team, target, anchor);
    			insert_dev(target, t14, anchor);
    			mount_component(otherteams, target, anchor);
    			insert_dev(target, t15, anchor);
    			mount_component(notifications, target, anchor);
    			insert_dev(target, t16, anchor);
    			mount_component(matchhistory, target, anchor);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, p);
    			append_dev(p, t18);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[15], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[16], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[17], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[18], false, false, false),
    					listen_dev(button4, "click", /*click_handler_4*/ ctx[19], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (!updating_correctUsername && dirty[0] & /*correctUsername*/ 2) {
    				updating_correctUsername = true;
    				modal_changes.correctUsername = /*correctUsername*/ ctx[1];
    				add_flush_callback(() => updating_correctUsername = false);
    			}

    			if (!updating_showLogin && dirty[0] & /*showLogin*/ 256) {
    				updating_showLogin = true;
    				modal_changes.showLogin = /*showLogin*/ ctx[8];
    				add_flush_callback(() => updating_showLogin = false);
    			}

    			if (!updating_loggedIn && dirty[0] & /*loggedIn*/ 1) {
    				updating_loggedIn = true;
    				modal_changes.loggedIn = /*loggedIn*/ ctx[0];
    				add_flush_callback(() => updating_loggedIn = false);
    			}

    			if (!updating_showModal && dirty[0] & /*showModal*/ 8) {
    				updating_showModal = true;
    				modal_changes.showModal = /*showModal*/ ctx[3];
    				add_flush_callback(() => updating_showModal = false);
    			}

    			modal.$set(modal_changes);
    			const team_changes = {};

    			if (!updating_teamEdit && dirty[0] & /*teamEdit*/ 16) {
    				updating_teamEdit = true;
    				team_changes.teamEdit = /*teamEdit*/ ctx[4];
    				add_flush_callback(() => updating_teamEdit = false);
    			}

    			if (!updating_loggedIn_1 && dirty[0] & /*loggedIn*/ 1) {
    				updating_loggedIn_1 = true;
    				team_changes.loggedIn = /*loggedIn*/ ctx[0];
    				add_flush_callback(() => updating_loggedIn_1 = false);
    			}

    			if (!updating_correctUsername_1 && dirty[0] & /*correctUsername*/ 2) {
    				updating_correctUsername_1 = true;
    				team_changes.correctUsername = /*correctUsername*/ ctx[1];
    				add_flush_callback(() => updating_correctUsername_1 = false);
    			}

    			if (!updating_players && dirty[0] & /*players*/ 1024) {
    				updating_players = true;
    				team_changes.players = /*players*/ ctx[10];
    				add_flush_callback(() => updating_players = false);
    			}

    			if (!updating_teamName && dirty[0] & /*teamName*/ 2048) {
    				updating_teamName = true;
    				team_changes.teamName = /*teamName*/ ctx[11];
    				add_flush_callback(() => updating_teamName = false);
    			}

    			if (!updating_abb && dirty[0] & /*abb*/ 4096) {
    				updating_abb = true;
    				team_changes.abb = /*abb*/ ctx[12];
    				add_flush_callback(() => updating_abb = false);
    			}

    			if (!updating__id && dirty[0] & /*_id*/ 8192) {
    				updating__id = true;
    				team_changes._id = /*_id*/ ctx[13];
    				add_flush_callback(() => updating__id = false);
    			}

    			if (!updating_updateTeamTrue && dirty[0] & /*updateTeamTrue*/ 32) {
    				updating_updateTeamTrue = true;
    				team_changes.updateTeamTrue = /*updateTeamTrue*/ ctx[5];
    				add_flush_callback(() => updating_updateTeamTrue = false);
    			}

    			if (!updating_clickedRegister && dirty[0] & /*clickedRegister*/ 4) {
    				updating_clickedRegister = true;
    				team_changes.clickedRegister = /*clickedRegister*/ ctx[2];
    				add_flush_callback(() => updating_clickedRegister = false);
    			}

    			team.$set(team_changes);
    			const otherteams_changes = {};

    			if (!updating_loggedInOthers && dirty[0] & /*loggedInOthers*/ 64) {
    				updating_loggedInOthers = true;
    				otherteams_changes.loggedInOthers = /*loggedInOthers*/ ctx[6];
    				add_flush_callback(() => updating_loggedInOthers = false);
    			}

    			if (!updating_correctUsername_2 && dirty[0] & /*correctUsername*/ 2) {
    				updating_correctUsername_2 = true;
    				otherteams_changes.correctUsername = /*correctUsername*/ ctx[1];
    				add_flush_callback(() => updating_correctUsername_2 = false);
    			}

    			otherteams.$set(otherteams_changes);
    			const notifications_changes = {};

    			if (!updating_notificationsToggle && dirty[0] & /*notificationsToggle*/ 128) {
    				updating_notificationsToggle = true;
    				notifications_changes.notificationsToggle = /*notificationsToggle*/ ctx[7];
    				add_flush_callback(() => updating_notificationsToggle = false);
    			}

    			if (!updating_loggedIn_2 && dirty[0] & /*loggedIn*/ 1) {
    				updating_loggedIn_2 = true;
    				notifications_changes.loggedIn = /*loggedIn*/ ctx[0];
    				add_flush_callback(() => updating_loggedIn_2 = false);
    			}

    			if (!updating_correctUsername_3 && dirty[0] & /*correctUsername*/ 2) {
    				updating_correctUsername_3 = true;
    				notifications_changes.correctUsername = /*correctUsername*/ ctx[1];
    				add_flush_callback(() => updating_correctUsername_3 = false);
    			}

    			notifications.$set(notifications_changes);
    			const matchhistory_changes = {};

    			if (!updating_matchHistoryToggle && dirty[0] & /*matchHistoryToggle*/ 512) {
    				updating_matchHistoryToggle = true;
    				matchhistory_changes.matchHistoryToggle = /*matchHistoryToggle*/ ctx[9];
    				add_flush_callback(() => updating_matchHistoryToggle = false);
    			}

    			if (!updating_correctUsername_4 && dirty[0] & /*correctUsername*/ 2) {
    				updating_correctUsername_4 = true;
    				matchhistory_changes.correctUsername = /*correctUsername*/ ctx[1];
    				add_flush_callback(() => updating_correctUsername_4 = false);
    			}

    			matchhistory.$set(matchhistory_changes);
    			if (!current || dirty[0] & /*output*/ 16384) set_data_dev(t18, /*output*/ ctx[14]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			transition_in(team.$$.fragment, local);
    			transition_in(otherteams.$$.fragment, local);
    			transition_in(notifications.$$.fragment, local);
    			transition_in(matchhistory.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			transition_out(team.$$.fragment, local);
    			transition_out(otherteams.$$.fragment, local);
    			transition_out(notifications.$$.fragment, local);
    			transition_out(matchhistory.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t12);
    			destroy_component(modal, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(team, detaching);
    			if (detaching) detach_dev(t14);
    			destroy_component(otherteams, detaching);
    			if (detaching) detach_dev(t15);
    			destroy_component(notifications, detaching);
    			if (detaching) detach_dev(t16);
    			destroy_component(matchhistory, detaching);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
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
    	let loggedIn = false;
    	let correctUsername = "";
    	let clickedRegister = false;
    	let showModal = true;
    	let teamEdit = false;
    	let updateTeamTrue = false;
    	let loggedInOthers = false;
    	let notificationsToggle = false;
    	let showLogin = true;
    	let matchHistoryToggle = false;

    	// $: updateTeamBoolean = updateTeamTrue;
    	let players = ["", "", "", "", ""];

    	let teamName = "";
    	let abb = "";
    	let _id = "";
    	let output = "";

    	const handleInput = e => {
    		$$invalidate(14, output = e.target.value);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, loggedIn = false);
    		$$invalidate(3, showModal = true);
    		$$invalidate(8, showLogin = true);
    		$$invalidate(1, correctUsername = "");
    	};

    	const click_handler_1 = () => {
    		$$invalidate(7, notificationsToggle = true);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(6, loggedInOthers = true);
    	};

    	const click_handler_3 = () => {
    		$$invalidate(2, clickedRegister = true);
    		console.log("Help", clickedRegister);
    	};

    	const click_handler_4 = () => {
    		$$invalidate(9, matchHistoryToggle = true);
    	};

    	function modal_correctUsername_binding(value) {
    		correctUsername = value;
    		$$invalidate(1, correctUsername);
    	}

    	function modal_showLogin_binding(value) {
    		showLogin = value;
    		$$invalidate(8, showLogin);
    	}

    	function modal_loggedIn_binding(value) {
    		loggedIn = value;
    		$$invalidate(0, loggedIn);
    	}

    	function modal_showModal_binding(value) {
    		showModal = value;
    		$$invalidate(3, showModal);
    	}

    	function team_teamEdit_binding(value) {
    		teamEdit = value;
    		$$invalidate(4, teamEdit);
    	}

    	function team_loggedIn_binding(value) {
    		loggedIn = value;
    		$$invalidate(0, loggedIn);
    	}

    	function team_correctUsername_binding(value) {
    		correctUsername = value;
    		$$invalidate(1, correctUsername);
    	}

    	function team_players_binding(value) {
    		players = value;
    		$$invalidate(10, players);
    	}

    	function team_teamName_binding(value) {
    		teamName = value;
    		$$invalidate(11, teamName);
    	}

    	function team_abb_binding(value) {
    		abb = value;
    		$$invalidate(12, abb);
    	}

    	function team__id_binding(value) {
    		_id = value;
    		$$invalidate(13, _id);
    	}

    	function team_updateTeamTrue_binding(value) {
    		updateTeamTrue = value;
    		$$invalidate(5, updateTeamTrue);
    	}

    	function team_clickedRegister_binding(value) {
    		clickedRegister = value;
    		$$invalidate(2, clickedRegister);
    	}

    	function otherteams_loggedInOthers_binding(value) {
    		loggedInOthers = value;
    		$$invalidate(6, loggedInOthers);
    	}

    	function otherteams_correctUsername_binding(value) {
    		correctUsername = value;
    		$$invalidate(1, correctUsername);
    	}

    	function notifications_notificationsToggle_binding(value) {
    		notificationsToggle = value;
    		$$invalidate(7, notificationsToggle);
    	}

    	function notifications_loggedIn_binding(value) {
    		loggedIn = value;
    		$$invalidate(0, loggedIn);
    	}

    	function notifications_correctUsername_binding(value) {
    		correctUsername = value;
    		$$invalidate(1, correctUsername);
    	}

    	function matchhistory_matchHistoryToggle_binding(value) {
    		matchHistoryToggle = value;
    		$$invalidate(9, matchHistoryToggle);
    	}

    	function matchhistory_correctUsername_binding(value) {
    		correctUsername = value;
    		$$invalidate(1, correctUsername);
    	}

    	$$self.$capture_state = () => ({
    		Modal,
    		Team,
    		MatchHistory,
    		OtherTeams,
    		Notifications,
    		loggedIn,
    		correctUsername,
    		clickedRegister,
    		showModal,
    		teamEdit,
    		updateTeamTrue,
    		loggedInOthers,
    		notificationsToggle,
    		showLogin,
    		matchHistoryToggle,
    		players,
    		teamName,
    		abb,
    		_id,
    		output,
    		handleInput
    	});

    	$$self.$inject_state = $$props => {
    		if ('loggedIn' in $$props) $$invalidate(0, loggedIn = $$props.loggedIn);
    		if ('correctUsername' in $$props) $$invalidate(1, correctUsername = $$props.correctUsername);
    		if ('clickedRegister' in $$props) $$invalidate(2, clickedRegister = $$props.clickedRegister);
    		if ('showModal' in $$props) $$invalidate(3, showModal = $$props.showModal);
    		if ('teamEdit' in $$props) $$invalidate(4, teamEdit = $$props.teamEdit);
    		if ('updateTeamTrue' in $$props) $$invalidate(5, updateTeamTrue = $$props.updateTeamTrue);
    		if ('loggedInOthers' in $$props) $$invalidate(6, loggedInOthers = $$props.loggedInOthers);
    		if ('notificationsToggle' in $$props) $$invalidate(7, notificationsToggle = $$props.notificationsToggle);
    		if ('showLogin' in $$props) $$invalidate(8, showLogin = $$props.showLogin);
    		if ('matchHistoryToggle' in $$props) $$invalidate(9, matchHistoryToggle = $$props.matchHistoryToggle);
    		if ('players' in $$props) $$invalidate(10, players = $$props.players);
    		if ('teamName' in $$props) $$invalidate(11, teamName = $$props.teamName);
    		if ('abb' in $$props) $$invalidate(12, abb = $$props.abb);
    		if ('_id' in $$props) $$invalidate(13, _id = $$props._id);
    		if ('output' in $$props) $$invalidate(14, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loggedIn,
    		correctUsername,
    		clickedRegister,
    		showModal,
    		teamEdit,
    		updateTeamTrue,
    		loggedInOthers,
    		notificationsToggle,
    		showLogin,
    		matchHistoryToggle,
    		players,
    		teamName,
    		abb,
    		_id,
    		output,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		modal_correctUsername_binding,
    		modal_showLogin_binding,
    		modal_loggedIn_binding,
    		modal_showModal_binding,
    		team_teamEdit_binding,
    		team_loggedIn_binding,
    		team_correctUsername_binding,
    		team_players_binding,
    		team_teamName_binding,
    		team_abb_binding,
    		team__id_binding,
    		team_updateTeamTrue_binding,
    		team_clickedRegister_binding,
    		otherteams_loggedInOthers_binding,
    		otherteams_correctUsername_binding,
    		notifications_notificationsToggle_binding,
    		notifications_loggedIn_binding,
    		notifications_correctUsername_binding,
    		matchhistory_matchHistoryToggle_binding,
    		matchhistory_correctUsername_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "world",
      },
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
