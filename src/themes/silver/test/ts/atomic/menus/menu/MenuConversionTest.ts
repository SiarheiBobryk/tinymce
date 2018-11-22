import { assert, UnitTest} from '@ephox/bedrock';
import { Menu } from '@ephox/bridge';
import * as MenuConversion from 'tinymce/themes/silver/ui/menus/menu/MenuConversion';

UnitTest.test('themes.silver.ui.menus.MenuConversion', () => {
  const buildMenuItem = (name: string, submenus?: string | (Menu.MenuItemApi | Menu.SeparatorMenuItemApi)[]): Menu.MenuItemApi => {
    return {
      type: 'menuitem',
      text: name,
      value: `${name}-value`,
      ...submenus ? { getSubmenuItems: () => submenus } : {}
    };
  };

  const separator: Menu.SeparatorMenuItemApi = {
    type: 'separator'
  };

  const menu1 = buildMenuItem('menu-1');
  const menu2 = buildMenuItem('menu-2');
  const submenu1 = buildMenuItem('submenu-1');
  const submenu2a = buildMenuItem('submenu-2a');
  const submenu2 = buildMenuItem('submenu-2', [ submenu2a ]);
  const nestedMenu = buildMenuItem('nested-menu-1', [ submenu1, separator, submenu2 ]);
  const nestedMenuWithReferences = buildMenuItem('nested-menu-2', 'submenu-1 | submenu-2');

  const menuItems = {
    'menu-1': menu1,
    'menu-2': menu2,
    'submenu-1': submenu1,
    'submenu-2': submenu2
  };

  const expandAndAssertEq = (items: string | Array<string | Menu.MenuItemApi>, expected) => {
    assert.eq(expected, MenuConversion.expand(items, menuItems));
  };

  // Menu reference
  expandAndAssertEq('menu-1 | menu-2', {
    items: [ menu1, separator, menu2 ],
    menus: { },
    expansions: { }
  });

  // Menu reference array
  expandAndAssertEq([ 'menu-1', '|', 'menu-2'], {
    items: [ menu1, separator, menu2 ],
    menus: { },
    expansions: { }
  });

  // Menu with submenus
  expandAndAssertEq([ nestedMenu ], {
    items: [ nestedMenu ],
    menus: {
      'nested-menu-1-value': [ submenu1, separator, submenu2 ],
      'submenu-2-value': [ submenu2a ]
    },
    expansions: {
      'nested-menu-1-value': 'nested-menu-1-value',
      'submenu-2-value': 'submenu-2-value'
    }
  });

  // Menu with submenu references
  expandAndAssertEq([ nestedMenuWithReferences ], {
    items: [ nestedMenuWithReferences ],
    menus: {
      'nested-menu-2-value': [ submenu1, separator, submenu2 ],
      'submenu-2-value': [ submenu2a ]
    },
    expansions: {
      'nested-menu-2-value': 'nested-menu-2-value',
      'submenu-2-value': 'submenu-2-value'
    }
  });
});