import { RealKeys } from '@ephox/agar';
import { before, context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.core.keyboard.HomeEndKeysTest', () => {
  const platform = PlatformDetection.detect();
  const hook = TinyHooks.bddSetupLight<Editor>({
    add_unload_trigger: false,
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [ Theme ], true);

  before(function () {
    // Skip OSX as it has differnt shortcuts for moving the cursor around in the content
    if (platform.os.isOSX()) {
      this.skip();
    }
  });

  const pKeystroke = (key: 'Home' | 'End') => (ctrlKey: boolean, shiftKey: boolean) =>
    RealKeys.pSendKeysOn('iframe => body', [ RealKeys.combo({ ctrlKey, shiftKey }, key) ]);

  context('Home', () => {
    const pHome = pKeystroke('Home');

    it('move to start of line of normal paragraph', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p>def</p>');
      TinySelections.setCursor(editor, [ 1, 0 ], 3);
      await pHome(false, false);
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
    });

    context('Ctrl', () => {
      it('move to start of content with normal paragraphs', async () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p>def</p>');
        TinySelections.setCursor(editor, [ 1, 0 ], 3);
        await pHome(true, false);
        TinyAssertions.assertCursor(editor, [ 0, 0 ], 0);
      });
    });

    context('Shift', () => {
      it('select to start of normal paragraph', async () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p>def</p>');
        TinySelections.setCursor(editor, [ 1, 0 ], 3);
        await pHome(false, true);
        TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 3);
      });
    });

    context('Ctrl+Shift', () => {
      it('select to start of content with normal paragraphs', async () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p>def</p>');
        TinySelections.setCursor(editor, [ 1, 0 ], 3);
        await pHome(true, true);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 3);
      });

      // TODO: <Jira> Does not work natively on IE11 but does on all other browsers
      it('TINY-7460: select to start of CEF span block', async function () {
        if (platform.browser.isIE()) {
          this.skip();
        }
        const editor = hook.editor();
        editor.setContent('<p><span contenteditable="false">CEF</span></p><p>abc</p>');
        TinySelections.setCursor(editor, [ 1, 0 ], 3);
        await pHome(true, true);
        if (platform.browser.isChrome()) {
          TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 1, 0 ], 3);
        } else {
          TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 1, 0 ], 3);
        }
      });

      it('TINY-7460: select to start of CEF block', async () => {
        const editor = hook.editor();
        editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');
        TinySelections.setCursor(editor, [ 2, 0 ], 3);
        await pHome(true, true);
        if (platform.browser.isIE()) {
          TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 3);
        } else {
          TinyAssertions.assertSelection(editor, [], 0, [ 1, 0 ], 3);
        }
      });

      // TODO: <Jira> Does not work natively on IE11 but does on all other browsers
      it('TINY-7460: select from end of CEF block to start of content', async function () {
        if (platform.browser.isIE()) {
          this.skip();
        }
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');
        TinySelections.setCursor(editor, [], 2);
        await pHome(true, true);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 2 ], 0);
      });
    });
  });

  context('End', () => {
    const pEnd = pKeystroke('End');

    it('move to end of line of normal paragraph', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p><p>def</p>');
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
      await pEnd(false, false);
      TinyAssertions.assertCursor(editor, [ 1, 0 ], 3);
    });

    context('Ctrl', () => {
      it('move to end of content with normal paragraphs', async () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p>def</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        await pEnd(true, false);
        TinyAssertions.assertCursor(editor, [ 1, 0 ], 3);
      });
    });

    context('Shift', () => {
      it('select to end of normal paragraph', async () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p>def</p>');
        TinySelections.setCursor(editor, [ 1, 0 ], 0);
        await pEnd(false, true);
        TinyAssertions.assertSelection(editor, [ 1, 0 ], 0, [ 1, 0 ], 3);
      });
    });

    context('Ctrl+Shift', () => {
      it('select to end of content with normal paragraphs', async () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p>def</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        await pEnd(true, true);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1, 0 ], 3);
      });

      // TODO: <Jira> Does not work natively on IE11 but does on all other browsers
      it('TINY-7460: select to end of CEF span block', async function () {
        if (platform.browser.isIE()) {
          this.skip();
        }
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p><span contenteditable="false">CEF</span></p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        await pEnd(true, true);
        if (platform.browser.isFirefox()) {
          TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1, 0, 0 ], 3);
        } else {
          TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 1 ], 1);
        }
      });

      it('TINY-7460: select to end of CEF block', async () => {
        const editor = hook.editor();
        editor.setContent('<p>abc</p><p contenteditable="false">CEF</p>');
        TinySelections.setCursor(editor, [ 0, 0 ], 0);
        await pEnd(true, true);
        TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [], 2);
      });

      // TODO: <Jira> Does not work natively on IE11 but does on all other browsers
      it('TINY-7460: select from start of CEF block to end of content', async function () {
        if (platform.browser.isIE()) {
          this.skip();
        }
        const editor = hook.editor();
        editor.setContent('<p contenteditable="false">CEF</p><p>abc</p>');
        TinySelections.setCursor(editor, [ 0 ], 0);
        await pEnd(true, true);
        if (platform.browser.isFirefox()) {
          TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 2, 0 ], 3);
        } else {
          TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 3 ], 0);
        }
      });
    });
  });
});
